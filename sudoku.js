

var sudoku = (function () {
    'use strict';

    var instance; // Sudoku instance
    
    /* cross-browser compatible addEventListener */
    var addEvent = function (elm, evtType, func) {
        if (elm.addEventListener) {
            elm.addEventListener(evtType, func, false);
        } else if (elm.attachEvent) {
            elm.attachEvent("on" + evtType, func);
        }
    };

    /* prevent an event from bubbling up its DOM hierarchy */
    var noBubble = function (e) {
        if (e && e.stopPropagation)
            e.stopPropagation();        
        else if (e && typeof e.cancelBubble != "undefined") e.cancelBubble = true;
    };

    /* prevent the default behaviour of an event */
    var noDefault = function (e) {
        var evt = e ? e : window.event;
        if (evt.preventDefault) evt.preventDefault();
        else if (evt) evt.returnValue = false;
    };

    /* Sudoku view ----updates----> Sudoku model */
    var updateMatrix = function (cell) {
        console.log(cell);
        instance.matrix[cell.row][cell.col] = +cell.value; // alternative of parseInt
    };
    
    /* TODO: do some value checking later on */
    var validateCellInput = function (cell) {

    };

    /* after the view changes, 1. update the model, 2. validate the input */
    var validateInput = function (e) {
        if (e) {
            var target;
            if (e.target) target = e.target;
            else target = e.srcElement; //IE
            
            if (target) { // if target cell is found
                updateMatrix(target);
                validateCellInput(target);
            }
        }
    };

    /* Check for conflicts on the same row and highlight the invalid cells on the view */
    var validateRow = function(row, col) {
        for (var i = 0; i < 9; i++) {
            if (i != col && instance.matrix[row][i] == instance.matrix[row][col]) {
                return false;
            }
        }
        return true;
    };

    /* Check for conflicts on the same column and highlight the invalid cells on the view */
    var validateColumn = function(row, col) {
        for (var i = 0; i < 9; i++) {            
            if (i != row && instance.matrix[i][col] == instance.matrix[row][col]) {
                return false;
            }
        }
        return true;
    };

    /* Check for conflicts on the same 3x3 grid and highlight the invalid cells on the view */
    var validateGrid = function(row, col) {
        var row_start = row - row%3;
        var col_start = col - col%3;
        for (var i = row_start; i < row_start+3; i++) {
            for (var j = col_start; j < col_start+3; j++) {
                if (i != row && j != col && instance.matrix[i][j] == instance.matrix[row][col]) {
                    return false;
                }
            }
        }
        return true;
    };

    var solve = function() {
        console.log("clicked solve");
    };

    var clear = function() {
        console.log("clicked clear");
    };


    /* Sudoku class constructor */
    var Sudoku = function () {
        this.board = null; // the board element (div#sudoku)
        this.matrix = []; //
        // zero the matrix
        for (var i = 0; i < 9; i++) {
            var row = [];
            for (var j = 0; j < 9; j++) {
                row.push(0);
            }
            this.matrix.push(row);
        }
        this.init();
    };

    Sudoku.prototype = {
        createSeparator: function () {
            var sep = document.createElement("div");
            sep.className = "clear";
            return sep;
        },

        createCell: function (row, col) {
            var cell = document.createElement("input");
            cell.setAttribute("maxlength", "1");
            cell.setAttribute("row", row);
            cell.setAttribute("col", col);
            cell.setAttribute("grid", (row - row%3) / 3 + (col - col%3) / 3);
            cell.row = row;
            cell.col = col;
            return cell;
        },

        addCells: function () {
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    this.board.appendChild(this.createCell(row, col));
                }
                this.board.appendChild(this.createSeparator());
            }
        },

        init: function () {
            // 1. create board
            this.board = document.getElementById("sudoku");
            if (this.board) {
                // 2. populate instance cells
                this.addCells();

                // 3. bind validate event to the game board
                addEvent(this.board, "keyup", function (e) { 
                    validateInput(e);
                });

                
            }
        }
    };

    var buildSudoku = function () {
        if (!instance) instance = new Sudoku();
    };

    var bindReady = function (handler) {
        var called = false;

        function ready() {
            if (called) return;
            called = true;
            setTimeout(handler, 4);
        }

        if (document.addEventListener) { // for modern browsers
            document.addEventListener("DOMContentLoaded", ready, false);
        }

        addEvent(window, "load", ready); // for old browsers (IE8)
    };

    bindReady(buildSudoku);

    return {
        newGame: function () {
        },
        clear: clear,
        solve: solve,
        matrix: function() { return instance.matrix; }
    };
})();