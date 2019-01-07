//TODO:

//close 'x' on each modal window
//interact with a single box to just look at those two colors
//save as ASE






(function () {

    /* global window, document, loadAse */

    "use strict";

    var
        //GLOBAL VARIABLES
        colorData = [], //array of all colors being evaluated, in [[r1,g1,b1],[r2,g2,b2],...] format
        selectedColorIndex, tempColor = [0, 0, 0], //hold information about a color that has been selected to be modified
        paletteTable, //table that displays the color grid

        //SETUP AND VIEW MANAGEMENT FUNCTIONS
        setupTransparentOverlayForModals, setupAddColorModal, setupModifyColorModal, setupFileManagement,
        constructTable, resizeTable, hideModals,
        
        //FUNCTIONS FOR ADDING AND CHANGING COLORS
        openAddColorModal, addColor,
        openModifyColorModal, updateModifyDisplay, shiftColorLuminosity, replaceColor, deleteColor,
          
        //COLOR TRANSFORMATION FUNCTIONS
        parseHex, parseRgb, rgbToHex, hexToRgb, RgbToHsl, HslToRgb, hueToRgb, isValidRgb,
        evaluateLuminosity, evaluateContrast, interpretContrast,
    
        //FILE MANAGEMENT FUNCTIONS
        openColorPaletteFile, saveAsCSV, downloadFile, timestamp;
        
    //When the window is loaded, calls the setup functions and constructs the initial table
    window.onload = function () {
        setupTransparentOverlayForModals();
        setupAddColorModal();
        setupModifyColorModal();
        
        setupFileManagement();
        
        paletteTable = document.getElementById("palette-table");
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
        var transparency = document.getElementById("transparency");
        transparency.onclick = function () {
            hideModals();
        };
    };

    //sets up the behaviors for the elements in the Add Color modal
    setupAddColorModal = function () {
        var hexInput = document.getElementById("hex"),
            redInput = document.getElementById("red"),
            greenInput = document.getElementById("green"),
            blueInput = document.getElementById("blue"),
            colorDisplay = document.getElementById("color-display"),
            cancelButton = document.getElementById("add-color-cancel-button"),
            confirmButton = document.getElementById("add-color-confirm-button");
        
        //this is repetitive. is there a more elegant way to do this?
        
        //event listeners for changes to the hex value
        hexInput.onchange = function () {
            parseHex(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        hexInput.onkeydown = function () { //this gets rid of the red 'error' color from invalid inputs
            hexInput.style.color = "#1e1e1e";
        };
        
        //event listeners for changes to the rgb value
        redInput.onchange = function () {
            parseRgb(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        redInput.onkeydown = function () {
            redInput.style.color = "#1e1e1e";
        };
        
        greenInput.onchange = function () {
            parseRgb(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        greenInput.onkeydown = function () {
            greenInput.style.color = "#1e1e1e";
        };
        
        blueInput.onchange = function () {
            parseRgb(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        blueInput.onkeydown = function () {
            blueInput.style.color = "#1e1e1e";
        };
        
        //cancel button closes the window without changing any data
        cancelButton.onclick = function () {
            hideModals();
        };
        
        //confirm button adds the new color to the table
        confirmButton.onclick = function () {
            addColor(redInput.value, greenInput.value, blueInput.value);
            hideModals();
        };
    };
    
    //sets up the behaviors for the elements in the Modify Color modal
    setupModifyColorModal = function () {
        var darkerButton = document.getElementById("darker-button"),
            lighterButton = document.getElementById("lighter-button"),
            cancelButton = document.getElementById("modify-color-cancel-button"),
            confirmButton = document.getElementById("modify-color-confirm-button"),
            deleteButton = document.getElementById("delete-color-button");
        
        darkerButton.onclick = function (e) {
            if (e.shiftKey) {
                tempColor = shiftColorLuminosity(tempColor, 0.02, -1);
            } else {
                tempColor = shiftColorLuminosity(tempColor, 0.001, -1);
            }
            updateModifyDisplay(tempColor);
        };
        
        lighterButton.onclick = function (e) {
            if (e.shiftKey) {
                tempColor = shiftColorLuminosity(tempColor, 0.02, 1);
            } else {
                tempColor = shiftColorLuminosity(tempColor, 0.001, 1);
            }
            updateModifyDisplay(tempColor);
        };
        
        cancelButton.onclick = function () {
            hideModals();
        };

        confirmButton.onclick = function () {
            replaceColor(tempColor, selectedColorIndex);
            hideModals();
        };
        
        deleteButton.onclick = function () {
            var response = window.confirm("Delete this color?");
            if (response === true) {
                deleteColor(selectedColorIndex);
                hideModals();
            }
        };
    };
    
    //adds event listeners for the buttons for loading and saving files
    setupFileManagement = function () {
        document.getElementById("load-file-input").addEventListener("change", openColorPaletteFile, false);
        document.getElementById("save-csv-button").addEventListener("click", function () {
            saveAsCSV(colorData);
        }, false);
    };
    
    //given an array colorData with [r,g,b] values for each color and an HTML table container paletteTable,
    //lays out the table that presents the colors and their contrasts
    constructTable = function (colorData, paletteTable) {

        paletteTable.innerHTML = "";

        //TOP ROW
        var labelRow = document.createElement("TR"),
            addColorButton = document.createElement("TD");

        paletteTable.appendChild(labelRow);

        //button to add a color, in the top left corner 
        addColorButton.id = "add-color-button";
        addColorButton.innerHTML = "Add color";
        addColorButton.onclick = function () {
            openAddColorModal();
        };
        labelRow.appendChild(addColorButton);

        //labels for each color in the palette, across the top row
        colorData.forEach(function (thisColor, i) {
            var topLabel = document.createElement("TD"),
                topLabelData = document.createElement("DIV");
            topLabel.className = "top-label-td";
            topLabel.onclick = function () {
                selectedColorIndex = i;
                openModifyColorModal(colorData, selectedColorIndex, 0);
            };
            labelRow.appendChild(topLabel);

            topLabelData.className = "top-label-data";
            topLabelData.style.borderColor = "rgb(" + thisColor[0] + "," + thisColor[1] + "," + thisColor[2] + ")";
            topLabelData.innerHTML = thisColor[0] + ", " + thisColor[1] + ", " + thisColor[2];
            topLabel.appendChild(topLabelData);
        });

        //GRID
        colorData.forEach(function (labelColor, i) {

            var gridRow = document.createElement("TR"),
                sideLabel = document.createElement("TD"),
                sideLabelData = document.createElement("DIV");

            paletteTable.appendChild(gridRow);

            //label on the left side
            sideLabel.className = "side-label-td";
            sideLabel.onclick = function () {
                selectedColorIndex = i;
                openModifyColorModal(colorData, selectedColorIndex, 1);
            };
            gridRow.appendChild(sideLabel);

            sideLabelData.className = "side-label-data";
            sideLabelData.style.borderColor = "rgb(" + labelColor[0] + "," + labelColor[1] + "," + labelColor[2] + ")";
            sideLabelData.innerHTML = labelColor[0] + ", " + labelColor[1] + ", " + labelColor[2];
            sideLabel.appendChild(sideLabelData);

            //all the colors in the row, another loop
            colorData.forEach(function (gridColor) {
                var gridItem = document.createElement("TD"),
                    gridData = document.createElement("DIV"),
                    contrastRating = document.createElement("DIV"),
                    contrastValue = document.createElement("DIV");

                gridItem.className = "grid-item";
                gridRow.appendChild(gridItem);

                gridData.className = "grid-data";
                gridData.style.backgroundColor = "rgb(" + labelColor[0] + "," + labelColor[1] + "," + labelColor[2] + ")";
                gridData.style.color = "rgb(" + gridColor[0] + "," + gridColor[1] + "," + gridColor[2] + ")";
                gridItem.appendChild(gridData);

                if (labelColor !== gridColor) {
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(evaluateContrast(gridColor, labelColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = evaluateContrast(gridColor, labelColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        });
    };
    
    //sets the size of the div containing the table to fit the table contents or fill the browser window, whichever is larger
    resizeTable = function () {
        var paletteContainer = document.getElementById("palette-container");
        paletteContainer.style.width = Math.max(paletteTable.clientWidth, document.documentElement.clientWidth - 30) + "px";
        paletteContainer.style.height = Math.max(paletteTable.clientHeight, document.documentElement.clientHeight  - 150) + "px";
    };

    //closes any modal window
    hideModals = function () {
        var transparency = document.getElementById("transparency"),
            modals = document.getElementsByClassName("modal-window");
        
        transparency.style.visibility = "hidden";
        [].forEach.call(modals, function (modal) {
            modal.style.visibility = "hidden";
        });
    };
    
    
    //FUNCTIONS FOR ADDING AND CHANGING COLORS
    
    //opens the modal window that allows a user to add a new color
    openAddColorModal = function () {
        var addColorModal = document.getElementById("add-color-modal"),
            transparency = document.getElementById("transparency");
         
        transparency.style.visibility = "visible";
        addColorModal.style.visibility = "visible";
    };
    
    //given r, g, and b values (shoud be integer 0-255), adds a color to colorData and updates the table
    addColor = function (r, g, b) {
        if ((isValidRgb(r) && isValidRgb(g) && isValidRgb(b))) {
            colorData.unshift([r, g, b]);
            constructTable(colorData, paletteTable);
        }
    };
    
    //opens the modal window that allows a user to modify or remove an existing color
    openModifyColorModal = function (colorData, colorIndex, topOrSide) {
        var modifyColorModal = document.getElementById("modify-color-modal"),
            transparency = document.getElementById("transparency"),
            selectedColorGrid = document.getElementById("selected-color-grid"),
            labelRow = document.createElement("TR"),
            label = document.createElement("TD"),
            labelData = document.createElement("DIV"),
            selectedColor = colorData[colorIndex],
            modifyControlsContainer = document.getElementById("modify-controls-container"),
            modifyColorDisplay = document.getElementById("modify-color-display");
    
        transparency.style.visibility = "visible";
        modifyColorModal.style.visibility = "visible";
        
        tempColor = selectedColor;
        
        selectedColorGrid.innerHTML = "";
        modifyColorDisplay.style.backgroundColor = "rgb(" + selectedColor[0] + "," + selectedColor[1] + "," + selectedColor[2] + ")";
        
        if (topOrSide === 0) {
            //if the clicked color was on the top, make a vertical column of the selected color and all the other colors
            
            //position the controls container to the right of the column.
            modifyControlsContainer.style.left = "170px";
            modifyControlsContainer.style.top = "100px";
            selectedColorGrid.className = "top"; //this is a hack so I can see which version of the grid I am using later
            
            //make the label
            selectedColorGrid.appendChild(labelRow);
            label.className = "top-label-td";
            labelRow.appendChild(label);

            labelData.className = "top-label-data";
            labelData.style.borderColor = "rgb(" + selectedColor[0] + "," + selectedColor[1] + "," + selectedColor[2] + ")";
            labelData.innerHTML = selectedColor[0] + ", " + selectedColor[1] + ", " + selectedColor[2];
            label.appendChild(labelData);
            
            //make a column of all the other elements
            colorData.forEach(function (color, index) {

                if (index !== colorIndex) {
                    var gridRow = document.createElement("TR"),
                        gridItem = document.createElement("TD"),
                        gridData = document.createElement("DIV"),
                        contrastRating = document.createElement("DIV"),
                        contrastValue = document.createElement("DIV");

                    selectedColorGrid.appendChild(gridRow);

                    gridItem.className = "grid-item";
                    gridRow.appendChild(gridItem);

                    gridData.className = "grid-data";
                    gridData.style.backgroundColor = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                    gridData.style.color = "rgb(" + selectedColor[0] + "," + selectedColor[1] + "," + selectedColor[2] + ")";
                    gridItem.appendChild(gridData);
                    
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(evaluateContrast(color, selectedColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = evaluateContrast(color, selectedColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
            
            
        } else {
            //if the clicked color was on the side, make a horizontal row of the selected color and all the other colors
            
            //position the controls container below a horizontal row and to the left
            modifyControlsContainer.style.left = "40px";
            modifyControlsContainer.style.top = "190px";
            selectedColorGrid.className = "side";
            
            //make the label
            selectedColorGrid.appendChild(labelRow);
            label.className = "side-label-td";
            labelRow.appendChild(label);

            labelData.className = "side-label-data";
            labelData.style.borderColor = "rgb(" + selectedColor[0] + "," + selectedColor[1] + "," + selectedColor[2] + ")";
            labelData.innerHTML = selectedColor[0] + ", " + selectedColor[1] + ", " + selectedColor[2];
            label.appendChild(labelData);
            
            //make a column of all the other elements
            colorData.forEach(function (color, index) {

                if (index !== colorIndex) {
                    var gridItem = document.createElement("TD"),
                        gridData = document.createElement("DIV"),
                        contrastRating = document.createElement("DIV"),
                        contrastValue = document.createElement("DIV");

                    gridItem.className = "grid-item";
                    labelRow.appendChild(gridItem);

                    gridData.className = "grid-data";
                    gridData.style.backgroundColor = "rgb(" + selectedColor[0] + "," + selectedColor[1] + "," + selectedColor[2] + ")";
                    gridData.style.color = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
                    gridItem.appendChild(gridData);
                    
                    contrastRating.className = "contrast-rating";
                    contrastRating.innerHTML = interpretContrast(evaluateContrast(color, selectedColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = evaluateContrast(color, selectedColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        }
    };

    updateModifyDisplay = function () {
        var selectedColorGrid = document.getElementById("selected-color-grid"),
            modifyColorDisplay = document.getElementById("modify-color-display"),
            label,
            gridDataElements = selectedColorGrid.getElementsByClassName("grid-data");

        modifyColorDisplay.style.backgroundColor = "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
        
        if (selectedColorGrid.className === "top") {
            
            label = selectedColorGrid.getElementsByClassName("top-label-data")[0];
           
            //change the border color and the label on the label data. 
            label.style.borderColor = "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
            label.innerHTML = tempColor[0] + ", " + tempColor[1] + ", " + tempColor[2];
            
            //change the font color for each other item in the grid
            [].forEach.call(gridDataElements, function (gridData) {
                var otherColorString, otherColor = [];
                
                gridData.style.color = "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
                
                otherColorString = gridData.style.getPropertyValue('background-color').toString().slice(0, -1).slice(4).split(',');

                otherColorString.forEach(function (component, i) {
                    otherColor[i] = parseInt(component, 10);
                });
                
                gridData.getElementsByClassName("contrast-rating")[0].innerHTML = interpretContrast(evaluateContrast(tempColor, otherColor));
                
                gridData.getElementsByClassName("contrast-value")[0].innerHTML = evaluateContrast(tempColor, otherColor).toFixed(2);
                
            });
            
        } else if (selectedColorGrid.className === "side") {
            
            label = selectedColorGrid.getElementsByClassName("side-label-data")[0];
            //change the border color and the label on the label data. 
            label.style.borderColor = "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
            label.innerHTML = tempColor[0] + ", " + tempColor[1] + ", " + tempColor[2];
            
            //change the background color for each other item in the grid
            [].forEach.call(gridDataElements, function (gridData) {
                var otherColorString, otherColor = [];
                
                gridData.style.backgroundColor = "rgb(" + tempColor[0] + "," + tempColor[1] + "," + tempColor[2] + ")";
                
                otherColorString = gridData.style.getPropertyValue('color').toString().slice(0, -1).slice(4).split(',');

                otherColorString.forEach(function (component, i) {
                    otherColor[i] = parseInt(component, 10);
                });
                
                gridData.getElementsByClassName("contrast-rating")[0].innerHTML = interpretContrast(evaluateContrast(tempColor, otherColor));
                
                gridData.getElementsByClassName("contrast-value")[0].innerHTML = evaluateContrast(tempColor, otherColor).toFixed(2);
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
        colorData.splice(colorIndex, 1, color);
        constructTable(colorData, paletteTable);
    };
    
    //removes the color at colorData[colorIndex]
    deleteColor = function (colorIndex) {
        colorData.splice(colorIndex, 1);
        constructTable(colorData, paletteTable);
    };
    

    //COLOR TRANSFORMATION FUNCTIONS

    parseHex = function (hexInput, redInput, greenInput, blueInput, colorDisplay) {
        var rgbValue = hexToRgb(hexInput.value);
        
        if (rgbValue !== null) {
            colorDisplay.style.backgroundColor = "#" + hexInput.value;
  
            redInput.value = rgbValue[0];
            greenInput.value = rgbValue[1];
            blueInput.value = rgbValue[2];
        } else {
            hexInput.style.color = "#cc0000";
        }
    };
    
    parseRgb = function (hexInput, redInput, greenInput, blueInput, colorDisplay) {
        var redValue = redInput.value,
            greenValue = greenInput.value,
            blueValue = blueInput.value;
        
        if (isValidRgb(redValue) && isValidRgb(greenValue) && isValidRgb(blueValue)) {
            
            colorDisplay.style.backgroundColor = "rgb(" + redValue + ", " + greenValue + ", " + blueValue + ")";
            
            hexInput.value = rgbToHex(redValue) + rgbToHex(greenValue) + rgbToHex(blueValue);
            
        } else {
            if (!(redValue >= 0 && redValue < 256)) {
                redInput.style.color = "#cc0000";
            }
            if (!(greenValue >= 0 && greenValue < 256)) {
                greenInput.style.color = "#cc0000";
            }
            if (!(blueValue >= 0 && blueValue < 256)) {
                blueInput.style.color = "#cc0000";
            }
        }
    };
    
    rgbToHex = function (rgb) {
        var hex = Number(rgb).toString(16);
        if (hex.length < 2) {
            hex = "0" + hex;
        }
        return hex;
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

    isValidRgb = function (val) {
        if (val !== "" && val >= 0 && val < 256) {
            return true;
        } else {
            return false;
        }
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
    
    //called after the user selects the file input button and chooses a file
    //evaluates whether the file is .ASE or .CSV; if so, reads the color information in the file and loads them into colorData
    //ASE handling is third party library
    //CSV handling has light error handling; if information doesn't match the expected format, it just won't load
    openColorPaletteFile = function () {

        var file = this.files[0],
            reader = new window.FileReader(),
            colorString = "";
        
        reader.onload = function () {
            var rawData = reader.result;
            
            if (file.name.split(".")[1] === "ase" || file.name.split(".")[1] === "ASE") {
                loadAse(rawData, function (palette, flattened) {
                    if (flattened.length > 0) {
                        
                        colorData = []; //reset the palette
            
                        flattened.forEach(function (color, index) {
                            var rgbColor = hexToRgb(color.substring(1));
                            colorData[index] = rgbColor;
                        });
                        constructTable(colorData, paletteTable);
                    }
                });
            } else if (file.type === "text/csv") {
                colorString = rawData.split("\n");
                if (colorString.length > 0) {
                    
                    colorData = []; //reset the palette 
                
                    colorString.forEach(function (color, index) {
                        var colorComponents = color.split(","),
                            validResult = true;

                        if (colorComponents.length === 3) {
                            
                            colorComponents.forEach(function (component, componentIndex) {
                                colorComponents[componentIndex] = parseInt(component, 10);
                                if (!isValidRgb(colorComponents[componentIndex])) {
                                    validResult = false;
                                }
                            });
                            
                            if (validResult === true) {
                                colorData[index] = colorComponents;
                            }
                        }
                    });
                    constructTable(colorData, paletteTable);
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
                saveString = saveString + color + "\n";
            });
            
            downloadFile("palette_" + timestamp + ".csv", saveString, "text/csv");
        }
	};
    
    //automatically downloads a file locally, by creating then emulating a click on a link
    //a bit hacky, but seemed the simplest way to get a file saved locally
    downloadFile = function (filename, text, filetype) {
        var element = document.createElement('a');
        element.setAttribute('href', 'data:' + filetype + ';charset=utf-8,' + encodeURIComponent(text));
        element.setAttribute('download', filename);

        element.style.display = 'none';
        document.body.appendChild(element);

        element.click();

        document.body.removeChild(element);
    };
    
    timestamp = function () {
        var d = new Date(),
            yr = d.getFullYear().toString(),
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

}());


