/*
Copyright (c) 2019, Daniel Soltis (daniel-soltis.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

//DATA STRUCTURE
//color data is stored as an object according to the format
//{ name: String, rgb: [Int, Int, Int], hex: String }

(function () {

    /* global window, document, loadAse, Blob, DataView, ArrayBuffer */

    "use strict";

    var
        //GLOBAL VARIABLES
        colorData = [], //array of all colors being evaluated
        selectedColorIndex, //index in the array above of a color that has been selected to be modified
        tempColor = {}, //holding object when a color is modified but not changed
        paletteTable, //table that displays the color grid

        //SETUP AND VIEW MANAGEMENT FUNCTIONS
        setupTransparentOverlayForModals, setupColorModal, setupMenuButtons, constructTable, resizeTable, hideModals, openAboutModal,
        
        //FUNCTIONS FOR ADDING AND CHANGING COLORS
        openAddColorModal, openModifyColorModal, updateColorDisplay, shiftColorLuminosity, addColor, replaceColor, deleteColor,
        
        //COLOR TRANSFORMATION FUNCTIONS
        updateTempColorFromHex, updateTempColorFromRgb, rgbToHex, hexToRgb, RgbToHsl, HslToRgb, hueToRgb, isValidRgb, isValidHex, isValidColor,
        evaluateLuminosity, evaluateContrast, interpretContrast,
    
        //FILE MANAGEMENT FUNCTIONS
        saveToLocalStorage, openColorPaletteFile, saveAsCSV, saveAsASE, saveForSketch, timestamp, downloadBlob, downloadURL;
        
    //When the window is loaded, calls the setup functions and constructs the initial table
    window.onload = function () {
        var savedDataString,
            index;
        
        setupTransparentOverlayForModals();
        setupColorModal();

        setupMenuButtons();
        
        paletteTable = document.getElementById("palette-table");
        if (typeof (Storage) !== "undefined") {
            
            savedDataString = window.localStorage.getItem("colorData");
             
            if (savedDataString !== null && savedDataString !== "") {
                savedDataString = savedDataString.split(",");
                for (index = 0; index < savedDataString.length / 5; index = index + 1) {
                    colorData[index] = {
                        rgb: [parseInt(savedDataString[5 * index], 10), parseInt(savedDataString[5 * index + 1], 10), parseInt(savedDataString[5 * index + 2], 10)],
                        hex: savedDataString[5 * index + 3],
                        name: savedDataString[5 * index + 4]
                    };
                }
            }
        }
        constructTable(colorData, paletteTable);
        resizeTable();
    };
    
    //If the user resizes the browser window, changes the size of the display to fit the new size
    window.onresize = function () {
        resizeTable();
    };

    //SETUP AND VIEW MANAGEMENT FUNCTIONS

    //sets up the transparent overlay that appears behind every modal window
    setupTransparentOverlayForModals = function () {
        var transparency = document.getElementById("transparency"),
            closeButtons = document.getElementsByClassName("close-button");
        transparency.onclick = function () {
            hideModals();
        };
        
        [].forEach.call(closeButtons, function (closeButton) {
            closeButton.addEventListener("click", function () {
                hideModals();
            });
        });
    };

    //sets up the behaviors for the elements in the Add Color modal
    
    setupColorModal = function () {
        var nameInput = document.getElementById("name-input"),
            redInput = document.getElementById("red-input"),
            greenInput = document.getElementById("green-input"),
            blueInput = document.getElementById("blue-input"),
            hexInput = document.getElementById("hex-input"),
            darkerButton = document.getElementById("darker-button"),
            lighterButton = document.getElementById("lighter-button"),
            cancelButton = document.getElementById("cancel-button"),
            confirmButton = document.getElementById("confirm-button"),
            deleteButton = document.getElementById("delete-color-button");
        
        //code for color inputs is repetitive. not sure how to make shorter without losing clarity
        
        //event listeners for changes to the rgb value
        nameInput.onchange = function () {
            tempColor.name = nameInput.value;
        };
        
        redInput.onchange = function () {
            //first check if everything is valid, then update tempColor and the display
            if (redInput.value >= 0 && redInput.value < 256) {
                if (isValidRgb([redInput.value, greenInput.value, blueInput.value])) {
                    updateTempColorFromRgb(redInput.value, greenInput.value, blueInput.value);
                    updateColorDisplay(tempColor);
                }
            } else {
                redInput.style.color = "#cc0000";
            }
        };
        redInput.onkeydown = function () { //this gets rid of the red 'error' color from invalid inputs
            redInput.style.color = "#1e1e1e";
        };
        
        greenInput.onchange = function () {
            if (greenInput.value >= 0 && greenInput.value < 256) {
                if (isValidRgb([redInput.value, greenInput.value, blueInput.value])) {
                    updateTempColorFromRgb(redInput.value, greenInput.value, blueInput.value);
                    updateColorDisplay(tempColor);
                }
            } else {
                greenInput.style.color = "#cc0000";
            }

        };
        greenInput.onkeydown = function () {
            greenInput.style.color = "#1e1e1e";
        };
        
        blueInput.onchange = function () {
            if (blueInput.value >= 0 && blueInput.value < 256) {
                if (isValidRgb([redInput.value, greenInput.value, blueInput.value])) {
                    updateTempColorFromRgb(redInput.value, greenInput.value, blueInput.value);
                    updateColorDisplay(tempColor);
                }
            } else {
                blueInput.style.color = "#cc0000";
            }
        };
        blueInput.onkeydown = function () {
            blueInput.style.color = "#1e1e1e";
        };
        
        //event listeners for changes to the hex value
        hexInput.onchange = function () {
            if (isValidHex(hexInput.value)) {
                updateTempColorFromHex(hexInput.value);
                updateColorDisplay(tempColor);
            } else {
                hexInput.style.color = "#cc0000";
            }
            
        };
        hexInput.onkeydown = function () {
            hexInput.style.color = "#1e1e1e";
        };
        
        darkerButton.addEventListener("click", function (e) {
            if (e.shiftKey) {
                tempColor.rgb = shiftColorLuminosity(tempColor.rgb, 0.02, -1);
                tempColor.hex = rgbToHex(tempColor.rgb);
            } else {
                tempColor.rgb = shiftColorLuminosity(tempColor.rgb, 0.001, -1);
                tempColor.hex = rgbToHex(tempColor.rgb);
            }
            updateColorDisplay(tempColor);
        });
        
        lighterButton.addEventListener("click", function (e) {
            if (e.shiftKey) {
                tempColor.rgb = shiftColorLuminosity(tempColor.rgb, 0.02, 1);
                tempColor.hex = rgbToHex(tempColor.rgb);
            } else {
                tempColor.rgb = shiftColorLuminosity(tempColor.rgb, 0.001, 1);
                tempColor.hex = rgbToHex(tempColor.rgb);
            }
            updateColorDisplay(tempColor);
        });
        
        //cancel button closes the window without changing any data
        cancelButton.addEventListener("click", function () {
            hideModals();
        });

        confirmButton.addEventListener("click", function () {
            var newColor = {};
            
            //check that everything is valid. if the user changes a number then immediately clicks the confirm button
            //then the .onchange event listener will be called first, and tempcolor will be updated according to the last value entered
            if (isValidRgb([redInput.value, greenInput.value, blueInput.value]) && isValidHex(hexInput.value)) {
                newColor.name = tempColor.name;
                newColor.rgb = [tempColor.rgb[0], tempColor.rgb[1], tempColor.rgb[2]];
                newColor.hex = tempColor.hex;
                
                if (selectedColorIndex === -1) {
                    addColor(newColor);
                } else {
                    replaceColor(newColor, selectedColorIndex);
                }
            }
        });
        
        deleteButton.onclick = function () {
            var response = window.confirm("Delete this color?");
            if (response === true) {
                deleteColor(selectedColorIndex);
                hideModals();
            }
            this.blur();
        };
    };
    
    //adds event listeners for the buttons for loading and saving files
    setupMenuButtons = function () {
        
        //when the user clicks on the 'load ASE ior CSV' button, this creates an HTML file input
        //and an event listener for when the user has selected a file to load.
        //i'm surprised this works. srs hack.
        document.getElementById("load-button").addEventListener("click", function () {
            var fileLoadElement = document.createElement("input");
            fileLoadElement.type = "file";
            fileLoadElement.accept = ".ase, .csv, .sketchpalette";
            fileLoadElement.value = null;
            fileLoadElement.addEventListener("change", openColorPaletteFile, false);
            fileLoadElement.click();
            this.blur();
        }, false);

        document.getElementById("save-csv-button").addEventListener("click", function () {
            saveAsCSV(colorData);
            this.blur();
        }, false);
        
        document.getElementById("save-ase-button").addEventListener("click", function () {
            saveAsASE(colorData);
            this.blur();
        }, false);
        
        document.getElementById("save-sketch-button").addEventListener("click", function () {
            saveForSketch(colorData);
            this.blur();
        }, false);
        
        document.getElementById("about-button").addEventListener("click", function () {
            openAboutModal();
        }, false);
        
        document.getElementById("clear-all-button").addEventListener("click", function () {
            var response = window.confirm("Remove all colors from the palette?");
            if (response === true) {
                colorData = [];
                constructTable(colorData, paletteTable);
            }
            this.blur();
        }, false);
            
    };
    
    //given an array colorData with [r,g,b] values for each color and an HTML table container paletteTable,
    //lays out the table that presents the colors and their contrasts
    constructTable = function (colorData, paletteTable) {
        var labelRow = document.createElement("TR"),
            addColorButtonCell = document.createElement("TD"),
            addColorButton = document.createElement("BUTTON");

        saveToLocalStorage(colorData);
        
        paletteTable.innerHTML = "";
        
        //TOP ROW
        paletteTable.appendChild(labelRow);

        //button to add a color, in the top left corner 
        addColorButtonCell.id = "add-color-button-cell";
        addColorButton.id = "add-color-button";
        addColorButton.className = "secondary-button";
        addColorButton.innerHTML = "Add color";
        addColorButton.onclick = function () {
            openAddColorModal();
        };
        labelRow.appendChild(addColorButtonCell);
        addColorButtonCell.appendChild(addColorButton);

        //labels for each color in the palette, across the top row
        colorData.forEach(function (thisColor, i) {
            var topLabel = document.createElement("TD"),
                topLabelData = document.createElement("BUTTON");
            topLabel.className = "top-label-td";
            topLabel.onclick = function () {
                selectedColorIndex = i;
                openModifyColorModal(colorData, i, 0);
            };
            labelRow.appendChild(topLabel);

            topLabelData.className = "top-label-data";
            topLabelData.style.borderColor = "rgb(" + thisColor.rgb[0] + "," + thisColor.rgb[1] + "," + thisColor.rgb[2] + ")";
            topLabelData.innerHTML = thisColor.rgb[0] + ", " + thisColor.rgb[1] + ", " + thisColor.rgb[2];
            topLabel.appendChild(topLabelData);
        });

        //GRID
        colorData.forEach(function (labelColor, i) {

            var gridRow = document.createElement("TR"),
                sideLabel = document.createElement("TD"),
                sideLabelData = document.createElement("BUTTON");

            paletteTable.appendChild(gridRow);

            //label on the left side
            sideLabel.className = "side-label-td";
            sideLabel.onclick = function () {
                selectedColorIndex = i;
                openModifyColorModal(colorData, i, 1);
            };
            gridRow.appendChild(sideLabel);

            sideLabelData.className = "side-label-data";
            sideLabelData.style.borderColor = "rgb(" + labelColor.rgb[0] + "," + labelColor.rgb[1] + "," + labelColor.rgb[2] + ")";
            sideLabelData.innerHTML = labelColor.rgb[0] + ", " + labelColor.rgb[1] + ", " + labelColor.rgb[2];
            sideLabel.appendChild(sideLabelData);

            //all the colors in the row, another loop
            colorData.forEach(function (gridColor) {
                var gridItem = document.createElement("TD"),
                    gridData = document.createElement("DIV"),
                    contrastRating = document.createElement("DIV"),
                    contrastValue = document.createElement("DIV"),
                    contrast;

                gridItem.className = "grid-item";
                gridRow.appendChild(gridItem);

                gridData.className = "grid-data";
                gridData.style.backgroundColor = "rgb(" + labelColor.rgb[0] + "," + labelColor.rgb[1] + "," + labelColor.rgb[2] + ")";
                gridData.style.color = "rgb(" + gridColor.rgb[0] + "," + gridColor.rgb[1] + "," + gridColor.rgb[2] + ")";
                gridItem.appendChild(gridData);

                if (labelColor !== gridColor) {
                    contrast = evaluateContrast(gridColor.rgb, labelColor.rgb);
                    
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(contrast);
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast.toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        });
    };
    
    //sets the size of the div containing the table to fit the table contents or fill the browser window, whichever is larger
    resizeTable = function () {
        var paletteContainer = document.getElementById("palette-container");
        paletteContainer.style.width = (document.documentElement.clientWidth - 48) + "px";
        paletteContainer.style.height = (document.documentElement.clientHeight  - paletteContainer.getBoundingClientRect().top - 32) + "px";
    };

    //closes any modal window
    hideModals = function () {
        var transparency = document.getElementById("transparency"),
            modals = document.getElementsByClassName("modal-window");
        
        transparency.style.visibility = "hidden";
        
        [].forEach.call(modals, function (modal) {
            modal.style.visibility = "hidden";
        });
        
        //Not graceful, but toggling the visibility for add and modify overrides the parent visiblity, so need to hide manually
        document.getElementById("darker-button").style.visibility = "hidden";
        document.getElementById("lighter-button").style.visibility = "hidden";
        document.getElementById("delete-color-button").style.visibility = "hidden";
        document.getElementById("instructions").style.visibility = "hidden";
        
        document.getElementById("table-container").style.visibility = "visible";
    };
    
    openAboutModal = function () {
        //SHOW MODAL WINDOW AND HIDE PALETTE GRID
        document.getElementById("transparency").style.visibility = "visible";
        document.getElementById("about-modal").style.visibility = "visible";
        document.getElementById("table-container").style.visibility = "hidden";
    };
    
    //FUNCTIONS FOR ADDING AND CHANGING COLORS
    
    //opens the modal window that allows a user to add a new color
    openAddColorModal = function () {
        selectedColorIndex = -1;
         
        //SHOW MODAL WINDOW AND HIDE PALETTE GRID
        document.getElementById("transparency").style.visibility = "visible";
        document.getElementById("color-modal").style.visibility = "visible";
        document.getElementById("table-container").style.visibility = "hidden";
        
        //RESET INPUT VALUES
        tempColor.name = "";
        tempColor.rgb = [null, null, null];
        tempColor.hex = "";

        document.getElementById("name-input").value = null;
        document.getElementById("red-input").value = null;
        document.getElementById("green-input").value = null;
        document.getElementById("blue-input").value = null;
        document.getElementById("hex-input").value = null;
        document.getElementById("color-display").style.backgroundColor = "#7F7F7F";
        document.getElementById("selected-color-grid").innerHTML = "";
        
        //HIDE THE ELEMENTS FOR MODIFYING AN EXISTING COLOR, ADJUST SIZES AND POSITIONS
        document.getElementById("controls-container").style.height = "280px";
        
        document.getElementById("darker-button").style.visibility = "hidden";
        document.getElementById("lighter-button").style.visibility = "hidden";
        document.getElementById("delete-color-button").style.visibility = "hidden";
        document.getElementById("instructions").style.visibility = "hidden";
        
        document.getElementById("controls-container").style.left = "32px";
        document.getElementById("controls-container").style.top = "80px";
        
        document.getElementById("darker-button").style.width = "0px";
        document.getElementById("lighter-button").style.width = "0px";
        document.getElementById("color-display").style.width = "240px";
        
        document.getElementById("add-modify-label").innerHTML = "Add new color";
        document.getElementById("confirm-button").innerHTML = "Add color";
    };
    
    //given r, g, and b values (shoud be integer 0-255), adds a color to colorData and updates the table
    addColor = function (color) {
        if (isValidColor(color)) {
            colorData.unshift(color);
            constructTable(colorData, paletteTable);
            hideModals();
        }
    };
    
    //opens the modal window that allows a user to modify or remove an existing color
    openModifyColorModal = function (colorData, colorIndex, topOrSide) {
        
        var selectedColorGrid = document.getElementById("selected-color-grid");
        selectedColorGrid.innerHTML = "";
         
        //SHOW MODAL WINDOW AND HIDE PALETTE GRID
        document.getElementById("transparency").style.visibility = "visible";
        document.getElementById("color-modal").style.visibility = "visible";
        document.getElementById("table-container").style.visibility = "hidden";
        
        //SET TEMP COLOR TO SELECTED COLOR
        tempColor.name = colorData[colorIndex].name;
        tempColor.rgb = colorData[colorIndex].rgb;
        tempColor.hex = colorData[colorIndex].hex;
        
        //HIDE THE ELEMENTS FOR MODIFYING AN EXISTING COLOR, ADJUST SIZES
        document.getElementById("controls-container").style.height = "400px";
        
        document.getElementById("darker-button").style.visibility = "visible";
        document.getElementById("lighter-button").style.visibility = "visible";
        document.getElementById("delete-color-button").style.visibility = "visible";
        document.getElementById("instructions").style.visibility = "visible";
        
        document.getElementById("darker-button").style.width = "69px";
        document.getElementById("lighter-button").style.width = "69px";
        document.getElementById("color-display").style.width = "96px";
        
        document.getElementById("add-modify-label").innerHTML = "Modify color";
        document.getElementById("confirm-button").innerHTML = "Update color";

        //GRID THAT SHOWS SELECTED COLOR WITH ALL OTHER COLORS
        
        if (topOrSide === 0) {
            
            selectedColorGrid.className = "top"; //this is a hack so I can see which version of the grid I am using later
            
            //if the clicked color was on the top, make a vertical column of the selected color and all the other colors
            //position the controls container to the right of the grid
            document.getElementById("controls-container").style.left = "156px";
            document.getElementById("controls-container").style.top = "80px";
            
            //make a column of all the other elements
            colorData.forEach(function (color, index) {

                if (index !== colorIndex) {
                    var gridRow = document.createElement("TR"),
                        gridItem = document.createElement("TD"),
                        gridData = document.createElement("DIV"),
                        contrastRating = document.createElement("DIV"),
                        contrastValue = document.createElement("DIV"),
                        contrast;

                    selectedColorGrid.appendChild(gridRow);

                    gridItem.className = "grid-item";
                    gridRow.appendChild(gridItem);

                    gridData.className = "grid-data";
                    gridData.style.backgroundColor = "rgb(" + color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + ")";
                    gridData.style.color = "rgb(" + tempColor.rgb[0] + "," + tempColor.rgb[1] + "," + tempColor.rgb[2] + ")";
                    gridItem.appendChild(gridData);
                    
                    contrast = evaluateContrast(color.rgb, tempColor.rgb);
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(contrast);
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast.toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
            
        } else {
            
            selectedColorGrid.className = "side";
            
            //if the clicked color was on the side, make a horizontal row of the selected color and all the other colors
            //position the grid to the left and below the controls container
            document.getElementById("controls-container").style.left = "32px";
            document.getElementById("controls-container").style.top = "160px";
            
            //make a column of all the other elements
            colorData.forEach(function (color, index) {

                if (index !== colorIndex) {
                    var gridItem = document.createElement("TD"),
                        gridData = document.createElement("DIV"),
                        contrastRating = document.createElement("DIV"),
                        contrastValue = document.createElement("DIV"),
                        contrast;

                    gridItem.className = "grid-item";
                    selectedColorGrid.appendChild(gridItem);

                    gridData.className = "grid-data";
                    gridData.style.backgroundColor = "rgb(" + tempColor.rgb[0] + "," + tempColor.rgb[1] + "," + tempColor.rgb[2] + ")";
                    gridData.style.color = "rgb(" + color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + ")";
                    gridItem.appendChild(gridData);
                    
                    contrast = evaluateContrast(color.rgb, tempColor.rgb);
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(contrast);
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast.toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        }
        updateColorDisplay();
    };

    updateColorDisplay = function () {
        var selectedColorGrid = document.getElementById("selected-color-grid"),
            redInput = document.getElementById("red-input"),
            greenInput = document.getElementById("green-input"),
            blueInput = document.getElementById("blue-input"),
            hexInput = document.getElementById("hex-input"),
            colorDisplay = document.getElementById("color-display"),
            gridDataElements = selectedColorGrid.getElementsByClassName("grid-data");

        colorDisplay.style.backgroundColor = "rgb(" + tempColor.rgb[0] + "," + tempColor.rgb[1] + "," + tempColor.rgb[2] + ")";
        
        document.getElementById("name-input").value = tempColor.name;
        redInput.value = tempColor.rgb[0];
        greenInput.value = tempColor.rgb[1];
        blueInput.value = tempColor.rgb[2];
        hexInput.value = tempColor.hex;
        
        redInput.style.color = "#1e1e1e";
        greenInput.style.color = "#1e1e1e";
        blueInput.style.color = "#1e1e1e";
        hexInput.style.color = "#1e1e1e";

        if (selectedColorIndex !== -1) {
            
            //change the font color for each other item in the grid
            [].forEach.call(gridDataElements, function (gridData) {
                var otherColorString, otherColor = [], contrast;

                if (selectedColorGrid.className === "top") {
                    otherColorString = gridData.style.getPropertyValue("background-color").toString().slice(0, -1).slice(4).split(",");
                    gridData.style.color = "rgb(" + tempColor.rgb[0] + "," + tempColor.rgb[1] + "," + tempColor.rgb[2] + ")";
                } else {
                    otherColorString = gridData.style.getPropertyValue("color").toString().slice(0, -1).slice(4).split(",");
                    gridData.style.backgroundColor = "rgb(" + tempColor.rgb[0] + "," + tempColor.rgb[1] + "," + tempColor.rgb[2] + ")";
                }

                otherColorString.forEach(function (component, i) {
                    otherColor[i] = parseInt(component, 10);
                });

                contrast = evaluateContrast(tempColor.rgb, otherColor);
                gridData.getElementsByClassName("contrast-rating")[0].innerHTML = interpretContrast(contrast);
                gridData.getElementsByClassName("contrast-value")[0].innerHTML = contrast.toFixed(2);

            });
        }
    };
    
    //takes a color as RGB array, step size (between 0 and 1) and direction (-1 or 1) and returns a color with a lighter or darker luminosity 
    shiftColorLuminosity = function (color, step, direction) {
        var tempHSL, newRGB, roundedRGB;
        
        tempHSL = new RgbToHsl(color[0], color[1], color[2]);
        tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
        
        newRGB = new HslToRgb(tempHSL[0], tempHSL[1], tempHSL[2]);
        roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];

       //if the step size is very small, this makes sure that the RGB value changes by at least 1
        while (color.toString() === roundedRGB.toString() && roundedRGB.toString() !== "0,0,0" && roundedRGB.toString() !== "255,255,255") {
            tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
            newRGB = new HslToRgb(tempHSL[0], tempHSL[1], tempHSL[2]);
            roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];
        }
        return roundedRGB;
    };
    
    //given a color and a colorIndex, replaces the color in colorData[colorIndex] with the new color
    replaceColor = function (color, colorIndex) {
        if (isValidColor(color)) {
            colorData.splice(colorIndex, 1, color);
            constructTable(colorData, paletteTable);
            hideModals();
        }
    };
    
    //removes the color at colorData[colorIndex]
    deleteColor = function (colorIndex) {
        colorData.splice(colorIndex, 1);
        constructTable(colorData, paletteTable);
    };
    
    //COLOR TRANSFORMATION FUNCTIONS

    //takes in a valid hex value and updates tempColor with the hex and rgb values
    updateTempColorFromHex = function (hex) {
        tempColor.hex = hex;
        tempColor.rgb = hexToRgb(hex).slice();
    };
    
    //takes in an array of r, g, b between 0 and 255 and updates tempColor with rgb and hex values
    updateTempColorFromRgb = function (r, g, b) {
        tempColor.rgb = [r, g, b];
        tempColor.hex = rgbToHex([r, g, b]);
    };
    
    //takes an an array [r, g, b] and returns a 6-digit hex value
    rgbToHex = function (rgb) {
        var hexString = "";
        rgb.forEach(function (val) {
            var hex = Number(val).toString(16);
            if (hex.length < 2) {
                hex = "0" + hex;
            }
            hexString += hex;
        });
        return hexString;
    };
    
    hexToRgb = function (hex) {
        var m = null;
        if (hex.length === 3) {
            m = hex.match(/([0-9a-f]{3})$/i);
            if (m !== null) {
                return [parseInt(m[0].charAt(0), 16) * 0x11, parseInt(m[0].charAt(1), 16) * 0x11, parseInt(m[0].charAt(2), 16) * 0x11];
            } else {
                return null;
            }
        } else if (hex.length === 6) {
            m = hex.match(/([0-9a-f]{6})$/i);
            if (m !== null) {
                return [parseInt(m[0].substring(0, 2), 16), parseInt(m[0].substring(2, 4), 16), parseInt(m[0].substring(4, 6), 16)];
            } else {
                return null;
            }
        } else {
            return null;
        }
    };
    
    RgbToHsl = function (r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        var max = Math.max(r, g, b), min = Math.min(r, g, b), h, s, l = (max + min) / 2, d = max - min;

        if (max === min) {
            h = s = 0; // achromatic
        } else {
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
            case r:
                h = (g - b) / d + (g < b ? 6 : 0);
                break;
            case g:
                h = (b - r) / d + 2;
                break;
            case b:
                h = (r - g) / d + 4;
                break;
            }
            h /= 6;
        }

        return [h, s, l];
    };
    
    HslToRgb = function (h, s, l) {
        var r, g, b,
            q = l < 0.5 ? l * (1 + s) : l + s - l * s,
            p = 2 * l - q;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            r = hueToRgb(p, q, h + 1 / 3);
            g = hueToRgb(p, q, h);
            b = hueToRgb(p, q, h - 1 / 3);
        }
        
        return [r * 255, g * 255, b * 255];
    };
    
    hueToRgb = function (p, q, t) {
        if (t < 0) {
            t += 1;
        }
        if (t > 1) {
            t -= 1;
        }
        if (t < 1 / 6) {
            return p + (q - p) * 6 * t;
        }
        if (t < 1 / 2) {
            return q;
        }
        if (t < 2 / 3) {
            return p + (q - p) * (2 / 3 - t) * 6;
        }
        return p;
    };
    
    //takes in an array [r, g, b] and checks if every value is between 0 and 255
    isValidRgb = function (rgb) {
        var valid = true;
        rgb.forEach(function (val) {
            if (val === "" || val < 0 || val >= 256) {
                valid = false;
            }
        });
        return valid;
    };
    
    //takes in a string and checks if it is a valid 3- or 6-digit hex string
    isValidHex = function (hex) {
        var m = null;
        if (hex.length === 3) {
            m = hex.match(/([0-9a-f]{3})$/i);
            if (m !== null) {
                return true;
            } else {
                return false;
            }
        } else if (hex.length === 6) {
            m = hex.match(/([0-9a-f]{6})$/i);
            if (m !== null) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    };
    
    isValidColor = function (color) {
        var matchHexAndRgb = (color.hex === rgbToHex(color.rgb));
        return isValidRgb(color.rgb) && matchHexAndRgb;
    };
    
    //takes an RGB color array [r,g,b] (0-255 range) and returns its luminosity
    evaluateLuminosity = function (c) {
        // http://www.w3.org/TR/WCAG20/#relativeluminancedef    
        var rgb, i, chan;
        rgb = [c[0], c[1], c[2]];
        for (i = 0; i < rgb.length; i = i + 1) {
            chan = rgb[i] / 255;
            rgb[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
        }
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    //takes 2 RGB color arrays [r,g,b] (0-255 range) and returns their contrast value
    evaluateContrast = function (c1, c2) {
        // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
        var lum1 = evaluateLuminosity(c1),
            lum2 = evaluateLuminosity(c2);
        if (lum1 > lum2) {
            return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
    };

    //takes a contrast value (0-21) and returns a text string corresponding to WCAG score
    interpretContrast = function (ct) {
        if (ct < 3.1) {
            return "Fail";
        }
        if (ct < 4.5) {
            return "AA large";
        }
        if (ct < 7) {
            return "AA";
        }
        return "AAA";
    };


    //FILE MANAGEMENT FUNCTIONS
    
    //Saves the data to local storage
    saveToLocalStorage = function (data) {
        var saveString = "";
        if (typeof (Storage) !== "undefined") {
            data.forEach(function (color) {
                saveString += color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + "," + color.hex + "," + color.name  + ",";
            });
        }
        window.localStorage.setItem("colorData", saveString.slice(0, -1));
    };
    
    //called after the user selects the file input button and chooses a file
    //evaluates whether the file is .ASE or .CSV; if so, reads the color information in the file and loads them into colorData
    //ASE handling is third party library
    //CSV handling has light error handling; if information doesn't match the expected format, it just won't load
    openColorPaletteFile = function () {

        var file = this.files[0],
            reader = new window.FileReader(),
            colorString = "";
        
        reader.onload = function () {
            
            var rawData = reader.result,
                paletteObject;
            
            if (file.name.split(".")[1] === "ase" || file.name.split(".")[1] === "ASE") {

                loadAse(rawData, function (palette) {
                    
                    var ungroupedColors = [];
                    
                    if (typeof palette.colors !== 'undefined') {
                        palette.colors.forEach(function (color) {
                            ungroupedColors.push(color);
                        });
                    }
                    
                    if (typeof palette.groups !== 'undefined') {
                        palette.groups.forEach(function (group) {
                            if (typeof group.colors !== 'undefined') {
                                group.colors.forEach(function (color) {
                                    ungroupedColors.push(color);
                                });
                            }
                        });
                    }
                    
                    if (ungroupedColors.length > 0) {
                        
                        colorData = []; //reset the palette
            
                        ungroupedColors.forEach(function (color) {
                           // var rgbColor = hexToRgb(color.substring(1));
                            colorData.push({
                                name : color.name,
                                rgb : [color.html_rgb[0], color.html_rgb[1], color.html_rgb[2]],
                                hex : rgbToHex(color.html_rgb)
                            });
                        });
                        constructTable(colorData, paletteTable);
                    } else {
                        window.alert("Error opening .ASE file. No colors?");
                    }
                });
            } else if (file.name.split(".")[1] === "sketchpalette") {
                paletteObject = JSON.parse(rawData);
                if (typeof paletteObject.colors !== undefined) {
                    if (paletteObject.colors.length > 0) {
                        
                        colorData = []; //reset the palette
            
                        paletteObject.colors.forEach(function (color) {
                           // var rgbColor = hexToRgb(color.substring(1));
                            var rgbArray = [parseInt(255 * color.red, 10), parseInt(255 * color.green, 10), parseInt(255 * color.blue, 10)];
                            colorData.push({
                                name : "",
                                rgb : rgbArray,
                                hex : rgbToHex(rgbArray)
                            });
                        });
                        constructTable(colorData, paletteTable);
                    } else {
                        window.alert("Error opening .sketchpalette file. No colors?");
                    }
                }

            } else if (file.type === "text/csv") {
                colorString = rawData.split("\n");
                if (colorString.length > 0) {
                    
                    colorData = []; //reset the palette 
                
                    colorString.forEach(function (color, index) {
                        var colorComponents = color.split(","),
                            validResult = true;
                        
                        if (colorComponents.length === 5) {
                            if (!isValidRgb([colorComponents[0], colorComponents[1], colorComponents[2]])) {
                                validResult = false;
                            }
    
                            if (validResult === true) {
                                colorData[index] = {
                                    rgb : [parseInt(colorComponents[0], 10), parseInt(colorComponents[1], 10), parseInt(colorComponents[2], 10)],
                                    hex : colorComponents[3],
                                    name : colorComponents[4]
                                };
                            }
                        }
                    });
                    if (colorData.length === 0) {
                        window.alert("Please check the CSV file. Each line should have a color in the format: red (0-255), green (0-255), blue (0-255), hex value, name");
                    } else {
                        constructTable(colorData, paletteTable);
                    }
                } else {
                    window.alert("Please check the CSV file. Each line should have a color in the format: red (0-255), green (0-255), blue (0-255), hex value, name");
                }
            } else {
                window.alert("Incompatible file format. Please load a .ASE or .CSV file");
            }
        };
        
        reader.readAsBinaryString(file);
    };
    
    //given an array, saves each element in the array on its own line, then downloads the file in .CSV format
    //because colorData is a nested array, each line is saved in the format r, g, b    
    saveAsCSV = function (data) {
        var saveString = "";
        
        if (data.length > 0) {
            data.forEach(function (color) {
                saveString = saveString + color.rgb[0] + "," + color.rgb[1] + "," + color.rgb[2] + "," + color.hex + "," + color.name +  "\n";
            });
            downloadBlob(saveString, "pal_" + timestamp() + ".csv", "text/csv");
        }
	};
    
    saveAsASE = function (data) {
    
        var buffer,
            view,
            allStringsLength = 0,
            bufferLength,
            byteIndex = 0;

        //calculate the length of the buffer needed for the ASE file
        //signature: 4 bytes
        //version: 4 bytes
        //number of blocks: 4 bytes
        //FOR EACH BLOCK - colorData.length
        //block start indicator: 2 bytes
        //block size: 4 bytes
        //name string length: 2 bytes
        //name string: 2*(color[3].length + 1) (different for each color)
        //color mode: 4 bytes
        //RGB color values: 3*4 bytes
        //type: 1 byte
        //padding: 1 byte
        data.forEach(function (color) {
            allStringsLength += color.name.length + 1;
        });

        bufferLength = 4 + 4 + 4 + data.length * (2 + 4 + 2  + 4 + 12 + 2) + 2 * allStringsLength;

        // create an ArrayBuffer with a size in bytes
        buffer = new ArrayBuffer(bufferLength);
        view = new DataView(buffer);

        //Set file signature ASEF as the first 4 characters
        [].forEach.call("ASEF", function (character, index) {
            view.setUint8(index, character.charCodeAt(0));
        });
        byteIndex += 4;

        //Set the version to be 1.0
        view.setInt16(byteIndex, 1);
        byteIndex += 2;
        view.setInt16(byteIndex, 0);
        byteIndex += 2;

        //Set the number of blocks, equal to the number of colors
        view.setInt32(byteIndex, data.length);
        byteIndex += 4;

        //for each block (each block represents a single color)
        data.forEach(function (color) {

            //indicate the start of a block through 2 bytes 0x01?
            view.setInt16(byteIndex, 1);
            byteIndex += 2;

            //calculate the size of this block (not including this or previous bytes)
            //2 bytes for the blocks indicating the string length
            //2 bytes per character, plus 2 terminal bytes, for the name string: colorData[0][3].length
            //4 bytes for the color mode
            //12 bytes for red, green and blue (4 bytes each) (could be different for different color mode)
            view.setInt32(byteIndex, 20 + 2 * (color.name.length + 1));
            byteIndex += 4;

            //name string length - note this is for the string with a terminal blank, not the number of bytes
            view.setInt16(byteIndex, color.name.length + 1);
            byteIndex += 2;

            color.name.split("").forEach(function (character) {
                view.setUint8(byteIndex, 0);
                view.setUint8(byteIndex + 1, character.charCodeAt(0));
                byteIndex += 2;
            });
            view.setInt16(byteIndex, 0);
            byteIndex += 2;

            //Set the color mode to RGB in 4 bytes
            view.setUint8(byteIndex, "R".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, "G".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, "B".charCodeAt(0));
            byteIndex += 1;
            view.setUint8(byteIndex, " ".charCodeAt(0));
            byteIndex += 1;

            //Set the color values. Finally!
            view.setFloat32(byteIndex, color.rgb[0] / 255);
            byteIndex += 4;
            view.setFloat32(byteIndex, color.rgb[1] / 255);
            byteIndex += 4;
            view.setFloat32(byteIndex, color.rgb[2] / 255);
            byteIndex += 4;

            //Set the color type
            view.setUint8(byteIndex, 0); //global color, seems safest.
            byteIndex += 1;

            //final padding byte
            view.setUint8(byteIndex, 0);
            byteIndex += 1;
        });

        downloadBlob(buffer, "pal_" + timestamp() + ".ase", 'application/octet-stream');
    };
    
    saveForSketch = function (colorData) {
        var colorPalette = [],
            fileData,
            saveString;

        colorData.forEach(function (color) {
            colorPalette.push({
                red: color.rgb[0] / 255,
                green: color.rgb[1] / 255,
                blue: color.rgb[2] / 255,
                alpha: 1
            });
        });

        fileData = {
            "compatibleVersion": "2.0", // min plugin version to load palette
            "pluginVersion": "2.14", //  version at the time this code was written
            "colors": colorPalette,
            "gradients": [],
            "images":  []
        };

        // Write file to chosen file path
        saveString = JSON.stringify(fileData);
        
        downloadBlob(saveString, "pal_" + timestamp() + ".sketchpalette");
    };

    timestamp = function () {
        var d = new Date(),
            yr = (d.getFullYear() % 100).toString(),
            mo = (d.getMonth() + 1).toString(),
            dy = d.getDate().toString(),
            hr = d.getHours().toString(),
            mi = d.getMinutes().toString();
        
        if (mo.length < 2) {
            mo = "0" + mo;
        }
        if (dy.length < 2) {
            dy = "0" + dy;
        }
        
        if (hr.length < 2) {
            hr = "0" + hr;
        }
        if (mi.length < 2) {
            mi = "0" + mi;
        }
        return yr + mo + dy + hr + mi;
    };
    
    downloadBlob = function (data, fileName, mimeType) {
        var blob, url;
        blob = new Blob([data], {
            type: mimeType
        });
        url = window.URL.createObjectURL(blob);
        downloadURL(url, fileName);
        window.setTimeout(function () {
            return window.URL.revokeObjectURL(url);
        }, 1000);
    };
    
    //automatically downloads a file locally, by creating then emulating a click on a link
    //a bit hacky, but seemed the simplest way to get a file saved locally
    downloadURL = function (data, fileName) {
        var a;
        a = document.createElement('a');
        a.href = data;
        a.download = fileName;
        document.body.appendChild(a);
        a.style = 'display: none';
        a.click();
        a.remove();
    };
    
}());


