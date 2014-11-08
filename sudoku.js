

var sudoku = (function () {
    'use strict';
    
    var addEvent = function (elm, evtType, func) {
        if (elm.addEventListener) {
            elm.addEventListener(evtType, func, false);
        } else if (elm.attachEvent) {
            elm.attachEvent("on" + evtType, func);
        }
    };

    var noBubble = function (e) {
        if (e && e.stopPropagation)
            e.stopPropagation();        
        else if (e && typeof e.cancelBubble != "undefined") e.cancelBubble = true;
    };

    var noDefault = function (e) {
        var evt = e ? e : window.event;
        if (evt.preventDefault) evt.preventDefault();
        else if (evt) evt.returnValue = false;
    };
    
    var validateCellInput = function (cell) {
        console.log(cell.value);
    };

    var validateInput = function (e) {
        if (e) {
            if (e.target) var target = e.target;
            else target = e.srcElement; //IE
            if (target)
                validateCellInput(target);
        }
    };


    var instance; // Sudoku instance

    // Sudoku class constructor
    var Sudoku = function () {
        this.board = null; // the board element (div#sudoku)
        this.matrix = []; 
        this.init();
    };

    Sudoku.prototype = {
        createSeparator: function () {
            var sep = document.createElement("div");
            sep.className = "clear";
            return sep;
        },

        createCell: function (x, y) {
            var cell = document.createElement("input");
            cell.setAttribute("maxlength", "1");
            cell._x = x;//conflict with chrome if name it x
            cell._y = y;
            return cell;
        },

        addCells: function () {
            // zero the matrix
            for (var x = 0; x < 9; x++) {
                for (var y = 0; y < 9; y++) {
                    this.board.appendChild(this.createCell(x, y));
                }
                this.board.appendChild(this.createSeparator());
            }
        },

        init: function () {
            // 1. create board
            this.board = document.getElementById("sudoku");
            if (this.board) {
                // 2. populate cells
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
        clear: function () {
        },
        solve: function () {
        }
    };
})();