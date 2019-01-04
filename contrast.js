(function () {

    /* global window, document */

    "use strict";

    var
        //GLOBAL VARIABLES
        colorData, paletteTable, selectedColorIndex, tempColor = [0, 0, 0],

        //SETUP FUNCTIONS
        setupModalBehavior, setupColorModal, setupModifyModal, constructTable,
        
        //FUNCTIONS FOR ADDING AND CHANGING COLORS
        openColorModal,  addColor, openModifyModal, replaceColor, deleteColor, changeColor, updateModifyDisplay,
    
        //UTILITY FUNCTIONS
        resizeTable, hideModals, parseHex, parseRGB, rgbToHex, hexToRGB, RGBtoHSL, HSLtoRGB, isValidRGB,
        luminosity, contrast, interpretContrast;
    
    colorData = [
        [0, 0, 0],
        [180, 80, 80],
        [127, 67, 255],
        [255, 255, 255]
    ];

    //TABLE LAYOUT
    //When the window loads, create the table filled with the default data
    window.onload = function () {
        
        setupModalBehavior();
        setupColorModal();
        setupModifyModal();
        
        paletteTable = document.getElementById("palette-table");
        constructTable(colorData, paletteTable);
        resizeTable();
    };

    //given an array colorData with r,g,b values for each color, lay out the table
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
            openColorModal();
        };
        labelRow.appendChild(addColorButton);

        //labels for each color in the palette, across the top row
        colorData.forEach(function (thisColor, i) {
            var topLabel = document.createElement("TD"),
                topLabelData = document.createElement("DIV");
            topLabel.className = "top-label-td";
            topLabel.onclick = function () {
                selectedColorIndex = i;
                openModifyModal(colorData, selectedColorIndex, 0);
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
                openModifyModal(colorData, selectedColorIndex, 1);
            };
            gridRow.appendChild(sideLabel);

            sideLabelData.className = "side-label-data";
            sideLabelData.style.borderColor = "rgb(" + labelColor[0] + "," + labelColor[1] + "," + labelColor[2] + ")";
            sideLabelData.innerHTML = labelColor[0] + ", " + labelColor[1] + ", " + labelColor[2];
            sideLabel.appendChild(sideLabelData);

            //do all the colors, another loop
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
                    contrastRating.innerHTML = interpretContrast(contrast(gridColor, labelColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast(gridColor, labelColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        });
    };

    //MODAL WINDOWS
    
    setupModalBehavior = function () {
        var transparency = document.getElementById("transparency");
        transparency.onclick = function () {
            hideModals();
        };
    };

    hideModals = function () {
        var transparency = document.getElementById("transparency"),
            modals = document.getElementsByClassName("modal-window");
        
        transparency.style.visibility = "hidden";
        [].forEach.call(modals, function (modal) {
            modal.style.visibility = "hidden";
        });
    };
    
    setupColorModal = function () {
        var hexInput = document.getElementById("hex"),
            redInput = document.getElementById("red"),
            greenInput = document.getElementById("green"),
            blueInput = document.getElementById("blue"),
            colorDisplay = document.getElementById("color-display"),
            cancelButton = document.getElementById("add-color-cancel-button"),
            confirmButton = document.getElementById("add-color-confirm-button");
        
        //this is repetitive. should find a more elegant way to do this
        //event listeners for changes to the hex value
        hexInput.onchange = function () {
            parseHex(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        hexInput.onkeydown = function () {
            hexInput.style.color = "#1e1e1e";
        };
        
         //event listeners for changes to the rgb value
        redInput.onchange = function () {
            parseRGB(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        redInput.onkeydown = function () {
            redInput.style.color = "#1e1e1e";
        };
        
        greenInput.onchange = function () {
            parseRGB(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        greenInput.onkeydown = function () {
            greenInput.style.color = "#1e1e1e";
        };
        
        blueInput.onchange = function () {
            parseRGB(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        blueInput.onkeydown = function () {
            blueInput.style.color = "#1e1e1e";
        };
        
        //cancel button just closes the window
        cancelButton.onclick = function () {
            hideModals();
        };
        
        //confirm button adds the color to the table
        confirmButton.onclick = function () {
            addColor(redInput.value, greenInput.value, blueInput.value);
        };
    };
    
    setupModifyModal = function () {
        var darkerButton = document.getElementById("darker-button"),
            lighterButton = document.getElementById("lighter-button"),
            cancelButton = document.getElementById("modify-color-cancel-button"),
            confirmButton = document.getElementById("modify-color-confirm-button"),
            deleteButton = document.getElementById("delete-color-button");
        
        darkerButton.onclick = function (e) {
            if (e.shiftKey) {
                tempColor = changeColor(tempColor, 0.02, -1);
            } else {
                tempColor = changeColor(tempColor, 0.001, -1);
            }
            updateModifyDisplay(tempColor);
        };
        
        lighterButton.onclick = function (e) {
            if (e.shiftKey) {
                tempColor = changeColor(tempColor, 0.02, 1);
            } else {
                tempColor = changeColor(tempColor, 0.001, 1);
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
            }
        };
    };
    
    //ADD NEW COLORS
    openColorModal = function () {
        var addColorModal = document.getElementById("add-color-modal"),
            transparency = document.getElementById("transparency");
         
        transparency.style.visibility = "visible";
        addColorModal.style.visibility = "visible";
    };
    
    addColor = function (r, g, b) {
        if ((isValidRGB(r) && isValidRGB(g) && isValidRGB(b))) {
            colorData.unshift([r, g, b]);
            constructTable(colorData, paletteTable);
            hideModals();
        }
    };
    
    //MODIFY EXISTING COLORS
    openModifyModal = function (colorData, colorIndex, topOrSide) {
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
            modifyControlsContainer.style.left = "150px";
            modifyControlsContainer.style.top = "80px";
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
                    contrastRating.innerHTML = interpretContrast(contrast(color, selectedColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast(color, selectedColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
            
            
        } else {
            //if the clicked color was on the side, make a horizontal row of the selected color and all the other colors
            
            //position the controls container below a horizontal row and to the left
            modifyControlsContainer.style.left = "20px";
            modifyControlsContainer.style.top = "160px";
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
                    contrastRating.innerHTML = interpretContrast(contrast(color, selectedColor));
                    gridData.appendChild(contrastRating);
                    contrastValue.className = "contrast-value";
                    contrastValue.innerHTML = contrast(color, selectedColor).toFixed(2);
                    gridData.appendChild(contrastValue);
                }
            });
        }
    };
    
    //takes a color as RGB array, step size (between 0 and 1) and direction (-1 or 1) and returns a color with a lighter or darker luminosity 
    changeColor = function (color, step, direction) {
        var tempHSL, newRGB, roundedRGB;
        
        tempHSL = new RGBtoHSL(color[0], color[1], color[2]);
        tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
        
        newRGB = new HSLtoRGB(tempHSL[0], tempHSL[1], tempHSL[2]);
        roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];

       //if the step size is small, this makes sure that the RGB value changes by at least 1
        while (color.toString() === roundedRGB.toString() && roundedRGB.toString() !== "0,0,0" && roundedRGB.toString() !== "255,255,255") {
            tempHSL[2] = Math.min(1, Math.max(0, tempHSL[2] + direction * step));
            newRGB = new HSLtoRGB(tempHSL[0], tempHSL[1], tempHSL[2]);
            roundedRGB = [Math.round(newRGB[0]), Math.round(newRGB[1]), Math.round(newRGB[2])];
        }
        return roundedRGB;
    };
    
    replaceColor = function (color, colorIndex) {
        colorData.splice(colorIndex, 1, color);
        constructTable(colorData, paletteTable);
        hideModals();
    };
    
    deleteColor = function (colorIndex) {
        colorData.splice(colorIndex, 1);
        constructTable(colorData, paletteTable);
        hideModals();
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
                
                gridData.getElementsByClassName("contrast-rating")[0].innerHTML = interpretContrast(contrast(tempColor, otherColor));
                
                gridData.getElementsByClassName("contrast-value")[0].innerHTML = contrast(tempColor, otherColor).toFixed(2);
                
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
                
                gridData.getElementsByClassName("contrast-rating")[0].innerHTML = interpretContrast(contrast(tempColor, otherColor));
                
                gridData.getElementsByClassName("contrast-value")[0].innerHTML = contrast(tempColor, otherColor).toFixed(2);
            });
            
        }
    };
    
    //UTLITY FOR CONVERTING HEX AND RGB
    
    parseHex = function (hexInput, redInput, greenInput, blueInput, colorDisplay) {
        var rgbValue = hexToRGB(hexInput.value);
        
        if (rgbValue !== null) {
            colorDisplay.style.backgroundColor = "#" + hexInput.value;
  
            redInput.value = rgbValue[0];
            greenInput.value = rgbValue[1];
            blueInput.value = rgbValue[2];
        } else {
            hexInput.style.color = "#cc0000";
        }
    };
    
    isValidRGB = function (val) {
        if (val !== "" && val >= 0 && val < 256) {
            return true;
        } else {
            return false;
        }
    };
    
    parseRGB = function (hexInput, redInput, greenInput, blueInput, colorDisplay) {
        var redValue = redInput.value,
            greenValue = greenInput.value,
            blueValue = blueInput.value;
        
        if (isValidRGB(redValue) && isValidRGB(greenValue) && isValidRGB(blueValue)) {
            
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
    
    hexToRGB = function (hex) {
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
    
    RGBtoHSL = function (r, g, b) {
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
    
    function hue2rgb(p, q, t) {
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
    }
    
    HSLtoRGB = function (h, s, l) {
        var r, g, b,
            q = l < 0.5 ? l * (1 + s) : l + s - l * s,
            p = 2 * l - q;

        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            r = hue2rgb(p, q, h + 1 / 3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1 / 3);
        }
        
        return [r * 255, g * 255, b * 255];
    };
    
    //EVALUATING CONTRAST
    
    //takes an RGB color array [r,g,b] (0-255 range) and returns its luminosity
    luminosity = function (c) {
        // http://www.w3.org/TR/WCAG20/#relativeluminancedef    
        var rgb, i, chan;
        rgb = [c[0], c[1], c[2]];
        for (i = 0; i < rgb.length; i = i + 1) {
            chan = rgb[i] / 255;
            rgb[i] = (chan <= 0.03928) ? chan / 12.92 : Math.pow(((chan + 0.055) / 1.055), 2.4);
        }
        return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
    };

    //takes 2 RGB color arrays [r,g,b] (0-255 range) and returns their contrast
    contrast = function (c1, c2) {
        // http://www.w3.org/TR/WCAG20/#contrast-ratiodef
        var lum1 = luminosity(c1),
            lum2 = luminosity(c2);
        if (lum1 > lum2) {
            return (lum1 + 0.05) / (lum2 + 0.05);
        }
        return (lum2 + 0.05) / (lum1 + 0.05);
    };

    //takes a contrast and returns an integral corresponding to WCAG score
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

    //SIZE MANAGEMENT
    //if the user changes the size of the browser window, resize the table to fit.
    resizeTable = function () {
        var paletteContainer = document.getElementById("palette-container");
        paletteContainer.style.width = Math.max(paletteTable.clientWidth, document.documentElement.clientWidth - 30) + "px";
        paletteContainer.style.height = Math.max(paletteTable.clientHeight, document.documentElement.clientHeight  - 150) + "px";
    };

    window.onresize = function () {
        resizeTable();
    };

}());


