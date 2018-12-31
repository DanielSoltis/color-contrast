(function () {

    /* global window, document */

    "use strict";

    var
        //GLOBAL VARIABLES
        colorData, paletteTable,

        //FUNCTIONS
        resizeTable, openColorModal, constructTable, parseHex, addColor;

    colorData = [
        [0, 0, 0],
        [127, 127, 127],
        [0, 0, 255],
        [255, 127, 0]
    ];

    //TABLE LAYOUT
    //When the window loads, create the table filled with the default data
    window.onload = function () {
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
            //addColor(Math.floor(256*Math.random()), Math.floor(256*Math.random()), Math.floor(256*Math.random()));
            openColorModal();
        };
        labelRow.appendChild(addColorButton);

        //labels for each color in the palette, across the top row
        colorData.forEach(function (thisColor) {
            var topLabel = document.createElement("TD"),
                topLabelData = document.createElement("DIV");
            topLabel.className = "top-label-td";
            labelRow.appendChild(topLabel);

            topLabelData.className = "top-label-data";
            topLabelData.style.borderColor = "rgb(" + thisColor[0] + "," + thisColor[1] + "," + thisColor[2] + ")";
            topLabelData.innerHTML = thisColor[0] + ", " + thisColor[1] + ", " + thisColor[2];
            topLabel.appendChild(topLabelData);
        });

        //GRID
        colorData.forEach(function (labelColor) {

            var gridRow = document.createElement("TR"),
                sideLabel = document.createElement("TD"),
                sideLabelData = document.createElement("DIV");

            paletteTable.appendChild(gridRow);

            //label on the left side
            sideLabel.className = "side-label-td";
            gridRow.appendChild(sideLabel);

            sideLabelData.className = "side-label-data";
            sideLabelData.style.borderColor = "rgb(" + labelColor[0] + "," + labelColor[1] + "," + labelColor[2] + ")";
            sideLabelData.innerHTML = labelColor[0] + ", " + labelColor[1] + ", " + labelColor[2];
            sideLabel.appendChild(sideLabelData);

            //do all the colors, another loop
            colorData.forEach(function (gridColor) {
                var gridItem = document.createElement("TD"),
                    gridData = document.createElement("DIV");

                gridItem.className = "grid-item";
                gridRow.appendChild(gridItem);

                gridData.className = "grid-data";
                gridData.style.backgroundColor = "rgb(" + gridColor[0] + "," + gridColor[1] + "," + gridColor[2] + ")";
                gridData.style.color = "rgb(" + labelColor[0] + "," + labelColor[1] + "," + labelColor[2] + ")";
                gridData.innerHTML = "AA";
                gridItem.appendChild(gridData);

            });
        });
    };

    //FUNCTIONS FOR ADDING NEW COLORS

    //make the . modal windows in html and set them hidden. then make them visible. this is silly.
    openColorModal = function () {
        var addColorModal = document.getElementById("add-color-modal"),
            transparency = document.getElementById("transparency"),
            hexInput = document.getElementById("hex"),
            redInput = document.getElementById("red"),
            greenInput = document.getElementById("green"),
            blueInput = document.getElementById("blue"),
            colorDisplay = document.getElementById("color-display");
         
        transparency.style.visibility = "visible";
        addColorModal.style.visibility = "visible";
        
        transparency.onclick = function () {
            addColorModal.style.visibility = "hidden";
            transparency.style.visibility = "hidden";
        };
        
        hexInput.onchange = function () {
            parseHex(hexInput, redInput, greenInput, blueInput, colorDisplay);
        };
        hexInput.onkeydown = function () {
            hexInput.style.color = "#1e1e1e";
        };
    };
    
    parseHex = function (hexInput, redInput, greenInput, blueInput, colorDisplay) {
        var hexValue = hexInput.value,
            m = null;
        
        if (hexValue.length === 3) {
            m = hexValue.match(/([0-9a-f]{3})$/i);
        } else if (hexValue.length === 6) {
            m = hexValue.match(/([0-9a-f]{6})$/i);
        }
        
        if (m !== null) {
            colorDisplay.style.backgroundColor = "#" + m[0];
            
            if (m[0].length === 3) {
                redInput.value = parseInt(m[0].charAt(0), 16) * 0x11;
                greenInput.value = parseInt(m[0].charAt(1), 16) * 0x11;
                blueInput.value = parseInt(m[0].charAt(2), 16) * 0x11;
            } else if (m[0].length === 6) {
                redInput.value = parseInt(m[0].substring(0, 2), 16);
                greenInput.value = parseInt(m[0].substring(2, 4), 16);
                blueInput.value = parseInt(m[0].substring(4, 6), 16);
            }
            
        } else {
            hexInput.style.color = "#cc0000";
        }
    };

    addColor = function (r, g, b) {
        colorData.unshift([r, g, b]);
        constructTable(colorData, paletteTable);
    };

    //SIZE MANAGEMENT
    //if the user changes the size of the browser window, resize the table to fit.
    resizeTable = function () {
        var paletteContainer = document.getElementById("palette-container");
        paletteContainer.style.width = Math.max(paletteTable.clientWidth, document.documentElement.clientWidth - 30) + "px";
        paletteContainer.style.height = Math.max(paletteTable.clientHeight, document.documentElement.clientHeight  - 140) + "px";
    };

    window.onresize = function () {
        resizeTable();
    };

}());


