"use strict";

var
    //GLOBAL VARIABLES
    colorData, paletteTable,
    
    //FUNCTIONS
    resizeTable, openColorModal, constructTable, addColor, setup;

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
    addColorButton.id = "add-color";
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
   /* var modalCover = document.createElement("DIV");
    modalCover.style.position = "absolute";
    modalCover.style.left = "0px";
    modalCover.style.top = "0px";
    modalCover.style.width = "100%";
    modalCover.style.height = "100%";
    modalCover.style.backgroundColor = "rgba(0,0,0,0.6)";
    document.body.appendChild(modalCover);
    var modalWindow = document.createElement("DIV");*/
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




