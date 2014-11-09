
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
    
    /* returns true if theClass is in string arr */
    var contains = function (arr, theClass) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === theClass) return true;
        }
        return false;
    };

    /* returns true if DOM element has theClass */
    var hasClass = function (el, theClass) {
        var retVal = false;
        if (el.className)
            retVal = contains(el.className.split(' '), theClass);
        return retVal;
    };

    var addClass = function (el, theClass) {
        if (!hasClass(el, theClass)) {
            if (el.className == "")
                el.className = theClass;
            else
                el.className += " " + theClass;
        }
    };

    var removeClass = function (el, theClass) {
        if (el.className) {
            var newClassName = "";
            var classes = el.className.split(" ");
            for (var i = 0, len = classes.length; i < len; i++) {
                if (classes[i] !== theClass) {
                    newClassName += classes[i] + " ";
                }
            }
            el.className = newClassName.replace(/^\s@|\s@$/g, ''); // IE8 doesn't support trim()
        }
    };

    // change this later
    var validateInput = function (e) {
        if (e) {
            var target = e.target || e.srcElement;
            
            if (target && target.nodeName.toLowerCase() == "input") { // if target cell is found
                // After each input, run the validation checks on the entire matrix.
                for (var i = 0; i < 9; i++) {
                    for (var j = 0; j < 9; j++) {
                        if (instance.matrix[i][j].value != "") {
                            var isValid = true;
                            if (!validateGrid(i, j)) {
                                // TODO: change CSS
                                isValid = false;
                                console.log("grid conflict");
                            }
                            if (!validateRow(i, j)) {
                                // TODO: change CSS, make it a modular function
                                isValid = false;
                                console.log("row conflict");
                            }
                            if (!validateColumn(i, j)) {
                                // TODO: change CSS
                                isValid = false;
                                console.log("col conflict");
                            }
                            if (isValid)
                                removeClass(instance.matrix[i][j], "invalid");
                            else
                                addClass(instance.matrix[i][j], "invalid");
                        }
                    }
                }
            }
        }
    };

    /* Check for conflicts on the same row and highlight the invalid cells on the view */
    var validateRow = function(row, col) {
        for (var i = 0; i < 9; i++) {
            if (i != col && instance.matrix[row][i].value == instance.matrix[row][col].value) {
                return false;
            }
        }
        return true;
    };

    var validateColumn = function(row, col) {
        for (var i = 0; i < 9; i++) {            
            if (i != row && instance.matrix[i][col].value == instance.matrix[row][col].value) {
                return false;
            }
        }
        return true;
    };

    var validateGrid = function(row, col) {
        var row_start = row - row%3;
        var col_start = col - col%3;
        for (var i = row_start; i < row_start+3; i++) {
            for (var j = col_start; j < col_start+3; j++) {
                if (!(i == row && j == col) && instance.matrix[i][j].value == instance.matrix[row][col].value) {
                    return false;
                }
            }
        }
        return true;
    };

    /**
     * Shuffle an array 
     * Source: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
     */
    var shuffle = function(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };

    /* http://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking */
    var solve = function(row, col) {
        /* shuffle the array used in the backtracking algorithm */
        var digits_array = shuffle([1,2,3,4,5,6,7,8,9]);

        /* base case */
        if (++col == 9) {
            col = 0;
            if (++row == 9) {
                return true;
            }
        }

        /* if grid is not empty */
        if (instance.matrix[row][col].value != "") {
            if (!(validateRow(row, col) && validateColumn(row, col) && validateGrid(row, col))) {
                return false;
            }
            return solve(row, col);
        }
        else { /* grid is empty */
            for (var i = 0; i < 9; i++) {
                instance.matrix[row][col].value = digits_array[i];
                if (validateRow(row, col) && validateColumn(row, col) && validateGrid(row, col)) // if no conflict, recurse
                    if (solve(row, col))
                        return true;
            }
            instance.matrix[row][col].value = "";
            return false;
        }
    };

    var clear = function() {
        // clear the model
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                instance.matrix[row][col].value = "";
                removeClass(instance.matrix[row][col], "invalid");
            }
        }
    };

    /**
     * Criterias of Sudoku difficulty: 
     * http://alwayspuzzling.blogspot.ca/2012/12/how-to-judge-difficulty-of-sudoku.html
     */

    /**
     * Creates a new Sudoku board with n_holes number of missing grid.
     * Easy: 45 holes
     * Medium: 49 holes
     * Difficult: 53 holes 
     */
    var createBoard = function(n_holes) {
        var grids_left = 9;
        var holes_per_grid;

        // 1. generate a solution
        solve(0, -1);

        
        for (var grid_rows = 0; grid_rows < 3; grid_rows++) {
            for (var grid_cols = 0; grid_cols < 3; grid_cols++) {
                holes_per_grid = Math.ceil(n_holes/grids_left);
                grids_left--;
                n_holes -= holes_per_grid;
                var digits_array = shuffle([1,2,3,4,5,6,7,8,9]).slice(0, holes_per_grid);
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        /* initially, make everything readonly */
                        instance.matrix[grid_rows*3+i][grid_cols*3+j].readOnly = true;
                        // 3. for each grid, remove holes_per_grid number of cells
                        for (var k = 0; k < digits_array.length; k++) {
                            /* if true, make hole */
                            if (instance.matrix[grid_rows*3+i][grid_cols*3+j].value == digits_array[k]) {
                                instance.matrix[grid_rows*3+i][grid_cols*3+j].value = "";
                                /* not a hole, make it readonly */
                                instance.matrix[grid_rows*3+i][grid_cols*3+j].readOnly = false;
                                console.log("# of holes");
                            }
                        }

                    }
                }
            }

        }
    }

    var createEasy = function() {
        createBoard(45);
    }

    var createMedium = function() {
        createBoard(49);
    }

    var createDifficult = function() {
        createBoard(53);
    }


    // Sudoku class constructor
    var Sudoku = function () {
        this.board = null; // the board element (div#sudoku)
        
        // initialize a matrix of 9 rows
        this.matrix = [];
        for (var i = 0; i < 9; i++) {
            var row = [];
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
            // cell.setAttribute("row", row);
            // cell.setAttribute("col", col);
            // cell.setAttribute("grid", (row - row%3) / 3 + (col - col%3) / 3);
            // cell.row = row;
            // cell.col = col;
            // cell.grid = (row - row%3) / 3 + (col - col%3) / 3;
            // assign the DOM cell to the corresponding matrix cell
            this.matrix[row][col] = cell;
            return cell;
        },

        addCells: function () {
            // zero the matrix
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
                // 2. populate cells
                this.addCells();

                // 3. delegate validate event up to the game board
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
        createEasy: createEasy,
        createMedium: createMedium,
        createDifficult: createDifficult,
        matrix: function() { return instance.matrix; },
        board: function() { return instance.board; }
    };
})();