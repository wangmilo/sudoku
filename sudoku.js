var sudokuOptions = {
    easy: 45,
    medium: 49,
    difficult: 53
};

var sudoku = (function (options) {
    'use strict';

    var instance; // Sudoku instance
    var isMobile = typeof window.orientation !== 'undefined';
    var currentCell; // the cell currently in focus by the user

/*---------------------- Generic Helpers ----------------------*/

    /* cross-browser compatible addEventListener */
    var addEvent = function(elm, evtType, func) {
        if (elm.addEventListener) {
            elm.addEventListener(evtType, func, false);
        } else if (elm.attachEvent) {
            elm.attachEvent("on" + evtType, func);
        }
    };

    var noDefault = function (e) {
        var evt = e ? e : window.event;
        if (evt.preventDefault) evt.preventDefault();
        else if (evt) evt.returnValue = false;
    };
    
    /* returns true if theClass is in string arr */
    var contains = function(arr, theClass) {
        var i = arr.length;
        while (i--) {
            if (arr[i] === theClass) return true;
        }
        return false;
    };

    /* returns true if DOM element has theClass */
    var hasClass = function(el, theClass) {
        if (el) {
            var retVal = false;
            if (el.className)
                retVal = contains(el.className.split(' '), theClass);
            
        }
        return retVal;
    };

    var addClass = function(el, theClass) {
        if (!hasClass(el, theClass)) {
            if (el.className == "")
                el.className = theClass;
            else
                el.className += " " + theClass;
        }
    };

    var removeClass = function(el, theClass) {
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

    /*
     * Shuffle an array 
     * Source: http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
     */
    var shuffle = function(o) {
        for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    };


/*---------------------- Validations ----------------------*/

    /* Checks the correctness of the Sudoku board. Add .invalid class to the problematic cells. */
    var validateInput = function(cell) {
        if (cell && cell.nodeName.toLowerCase() == "input") { // if target cell is found
            if (!/[1-9]/.test(cell.value)) { // allow only 1-9 as input
                cell.value = "";
                return;
            }
            /* After each input, run the validation checks on the entire matrix. */
            for (var i = 0; i < 9; i++) {
                for (var j = 0; j < 9; j++) {
                    if (instance.matrix[i][j].value != "") { /* don't run on filled tiles */
                        var isValid = true;
                        if (!validateGrid(i, j) || !validateRow(i, j) || !validateColumn(i, j)) {
                            isValid = false;
                        }
                        if (isValid) {
                            removeClass(instance.matrix[i][j], "invalid");
                        }
                        else {
                            addClass(instance.matrix[i][j], "invalid");
                        }
                    }
                }
            }
        }
        if (cell.value == "") removeClass(cell, "invalid");
    };

    /* Ensure a row contains the number only once. */
    var validateRow = function(row, col) {
        for (var i = 0; i < 9; i++) {
            if (i != col && instance.matrix[row][i].value == instance.matrix[row][col].value) {
                return false;
            }
        }
        return true;
    };

    /* Ensure a column contains the number only once. */
    var validateColumn = function(row, col) {
        for (var i = 0; i < 9; i++) {            
            if (i != row && instance.matrix[i][col].value == instance.matrix[row][col].value) {
                return false;
            }
        }
        return true;
    };

    /* Ensure a 3x3 box contains the number only once. */
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

    /* http://en.wikipedia.org/wiki/Sudoku_solving_algorithms#Backtracking */
    var solve = function(row, col) {
        /* shuffle the array used in the backtracking algorithm */
        var digits_to_remove = shuffle([1,2,3,4,5,6,7,8,9]);

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
                instance.matrix[row][col].value = digits_to_remove[i];
                if (validateRow(row, col) && validateColumn(row, col) && validateGrid(row, col)) // if no conflict, recurse
                    if (solve(row, col))
                        return true;
            }
            instance.matrix[row][col].value = "";
            return false;
        }
    };

    /* Clear the puzzle board */
    var clear = function() {
        for (var row = 0; row < 9; row++) {
            for (var col = 0; col < 9; col++) {
                instance.matrix[row][col].value = "";
                removeClass(instance.matrix[row][col], "invalid");
            }
        }
    };

    /* Create a new Sudoku board. Difficulties can be configured in sudokuOptions.
     *
     * The algorithm works like this: First, generate a complete solution.
     * Then delete n_holes cells from the solution.
     *
     * To ensure an even distribution of deleted cells, 
     * I iterated over the puzzle one 3x3 grid at a time, 
     * deleting a calculated the number of blank cells from each grid.
     */
    var createBoard = function(n_holes) {
        var grids_left = 9;
        var holes_per_grid;

        // 1. Generate a solution
        solve(0, -1);
        // 2. Iterate through the 9 3x3 grids.
        for (var grid_rows = 0; grid_rows < 3; grid_rows++) {
            for (var grid_cols = 0; grid_cols < 3; grid_cols++) {
                holes_per_grid = Math.ceil(n_holes/grids_left);
                grids_left--;
                n_holes -= holes_per_grid;
                // 3. randomly decide which digits to remove from the current 3x3 grid.
                var digits_to_remove = shuffle([1,2,3,4,5,6,7,8,9]).slice(0, holes_per_grid);
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        var row = grid_rows*3+i;
                        var col = grid_cols*3+j;

                        // 4. make everything readOnly
                        instance.matrix[row][col].readOnly = true;
                        addClass(instance.matrix[row][col], "immutable");

                        // 5. for each grid, remove holes_per_grid number of cells
                        for (var k = 0; k < digits_to_remove.length; k++) {
                            if (instance.matrix[row][col].value == digits_to_remove[k]) {
                                instance.matrix[row][col].value = "";
                                // 6. allow the user to fill in the deleted cells
                                removeClass(instance.matrix[row][col], "immutable");
                                
                                if (!isMobile) { // if desktop, allow keyboard input
                                    instance.matrix[row][col].readOnly = false;
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    var newPuzzle = function(level) {
        switch(level) {
            case 1:
                createBoard(options.easy);
                break;
            case 2:
                createBoard(options.medium);
                break;
            case 3:
                createBoard(options.difficult);
                break;
            default:
                break;
        }
    }

    /* Sudoku class constructor */
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
        /* dividerType: 0 - 0px new line, 1 - grid row border, 2 - grid column border */
        createDivider: function(dividerType) {
            var divider = document.createElement("div");
            divider.className = dividerType ? (dividerType == 1 ? "sep row" : "col") : "sep";
            return divider;
        },

        createCell: function(row, col) {
            var cell = document.createElement("input");
            cell.setAttribute("maxlength", "1");

            /* if mobile, make every cell readOnly to prevent mobile keyboard from appearing. We'll rely on the mobile game UI. */
            if (isMobile) cell.readOnly = true;

            addEvent(cell, "mouseup", noDefault); // prevent mouseup event from immediately deselecting focused text

            /* Event handler that keeps track of the cell currently in focus, 
             * so virtual keyboard can manipulate it later. */
            addEvent(cell, "focus", function(e) {
                var target = e.target || e.srcElement;
                if (target.nodeName.toLowerCase() == "input") {
                    if (hasClass(currentCell, "selected")) { // remove previous currentCell's .selected class
                        removeClass(currentCell, "selected");
                    } 
                    currentCell = e.target || e.srcElement;
                    if (hasClass(currentCell, "immutable")) {
                        currentCell = null; // currentCell cannot be an immutable element
                    }
                        
                    if (currentCell) {
                        addClass(currentCell, "selected");
                        currentCell.select();
                    }
                } 
                else {
                    currentCell = null;
                }
            });

            // assign the DOM cell to the corresponding matrix cell
            this.matrix[row][col] = cell;
            return cell;
        },

        /* Initiate the board (and hook the cells to the matrix) */
        addCells: function () {
            for (var row = 0; row < 9; row++) {
                for (var col = 0; col < 9; col++) {
                    this.board.appendChild(this.createCell(row, col));
                    if (col == 2 || col == 5) {
                        this.board.appendChild(this.createDivider(2)); // create a vertical border for the grid
                    }
                }
                if (row == 2 || row == 5) { // create a horizontal border for the grid
                    this.board.appendChild(this.createDivider(1));
                } else { // create a new line
                    this.board.appendChild(this.createDivider(0));
                }
            }
        },

        /* Create a virtual keyboard for touchscreen devices. Or as an alternative input source. */
        addVirtualKeyboard: function() {
            var virtualKeyboard = document.getElementById("virtualKeyboard");

            for (var i = 0; i < 10; i++) {
                var digit = document.createElement("button"); // create a button
                digit.value = i; // number the button
                digit.innerHTML = i ? i : "X";
                virtualKeyboard.appendChild(digit); // add it to the container
                if (isMobile && i == 4) virtualKeyboard.appendChild(this.createDivider(0));
                addEvent(digit, "click", function(e) {
                    if (currentCell) {
                        if (this.value == 0) this.value = "";
                        currentCell.value = this.value;
                        validateInput(currentCell);
                    }
                });
            }
        },

        init: function () {
            // 1. create board
            this.board = document.getElementById("sudoku");
            if (this.board) {
                // 2. populate cells
                this.addCells();

                // 3. add virtual keyboard UI
                this.addVirtualKeyboard();

                // 4. delegate validate event up to the game board
                addEvent(this.board, "keyup", function(e) { 
                    var targetCell = e.target || e.srcElement;
                    validateInput(targetCell);
                }); 
            }
        }
    };

    var buildSudoku = function () {
        if (!instance) instance = new Sudoku();
    };

    /* waits for DOM ready, then call handler */
    var bindReady = function(handler) {
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
        newPuzzle: newPuzzle,
        clear: clear,
        solve: solve,
        // uncomment for debugging
        // matrix: function() { return instance.matrix; },
        // board: function() { return instance.board; }
    };
})(sudokuOptions);