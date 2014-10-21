/*!
 * jQuery lightweight plugin boilerplate
 * Original author: @ajpiano
 * Further changes, comments: @addyosmani
 * Licensed under the MIT license
 */


// the semi-colon before the function invocation is a safety 
// net against concatenated scripts and/or other plugins 
// that are not closed properly.
;(function ( $, window, document, undefined ) {
    
    // undefined is used here as the undefined global 
    // variable in ECMAScript 3 and is mutable (i.e. it can 
    // be changed by someone else). undefined isn"t really 
    // being passed in so we can ensure that its value is 
    // truly undefined. In ES5, undefined can no longer be 
    // modified.
    
    // window and document are passed through as local 
    // variables rather than as globals, because this (slightly) 
    // quickens the resolution process and can be more 
    // efficiently minified (especially when both are 
    // regularly referenced in your plugin).

    // Create the defaults once
    var pluginName = "gantt",
        defaults = {
            width: "800px",
            height: "500px",
        },
        // Dynamic internal properties
        dynprops = {
            max_rows: 10,
            task_width: 100,
            task_height: 20,
            label_width: 200,
        };

    // The actual plugin constructor
    function Plugin( element, options ) {
        this.element = element;
        this.$el = $(element);

        // jQuery has an extend method that merges the 
        // contents of two or more objects, storing the 
        // result in the first object. The first object 
        // is generally empty because we don"t want to alter 
        // the default options for future instances of the plugin
        this.options = $.extend( {}, defaults, options) ;
        this.dynprops = dynprops;
        this.tasks = {};

        this._defaults = defaults;
        this._name = pluginName;
        
        this.init();
    }

    Plugin.prototype.init = function () {
        // Place initialization logic here
        // You already have access to the DOM element and
        // the options via the instance, e.g. this.element 
        // and this.options

        // TODO edit task when click on edit button on task

        // TODO drag task to different rows and dates

        this.calc_dynprops();
        this.set_listeners();
        this.draw();
    };

    Plugin.prototype.set_listeners = function () {
        var plugin = this;

        this.$el.click(function (event) {
            var $obj = $(event.target);
            if ($obj.attr("class") === "gantt-row") {
                var x = event.offsetX + plugin.dynprops.label_width,
                    y = $obj.css("top").split("px")[0];

                plugin.add_task({ 
                    x: x,
                    y: y
                });
            }
        });

    };

    Plugin.prototype.width = function () {
        return this.options.width.split("px")[0];
    };

    Plugin.prototype.height = function () {
        return this.options.height.split("px")[0];
    };

    Plugin.prototype.calc_dynprops = function () {
        // Calculate dynamic variables for drawing

        // Height of a task, determined by the current amount of rows and height of screen
        this.dynprops.task_height = this.options.height.split("px")[0] / this.dynprops.max_rows;

        //TODO
        // date_points list keeping track of the vertical date bars


    };

    Plugin.prototype.draw = function () {

        this._construct_container();
        this._construct_rows();
        this._construct_timelines();
        this._construct_tasks();
    };

    Plugin.prototype._construct_container = function () {
        // Construct the container for the diagram

        this.$el.empty().removeClass().attr("gantt-id", "canvas").css({
            position: "relative",
            display: "block",
            border: "2px solid black",
            background: "white",
            margin: "0 auto",
            width: this.options.width,
            height: this.options.height,
            overflow: "hidden",
        });
    };

    Plugin.prototype._construct_timelines = function () {
        // Add the vertical lines indicating dates

        var date_pos = [],
            line_count = 5,
            width_num = this.options.width.split("px")[0] - dynprops.label_width,
            distance = width_num / line_count;

        for (var i = 1; i < line_count; i++) {
            var pos = parseInt(i * distance + dynprops.label_width, 10);
            date_pos.push(pos);

            $("<div class='gantt-dia-timeline'></div>").css({
                position: "absolute",
                "border-right": "1px solid rgba(0,0,0,0.2)",
                left: "" + pos + "px",
                top: "10px",
                width: 0,
                height: (this.options.height.split("px")[0] - 20) + "px",
            }).appendTo(this.$el);
        }
    };

    Plugin.prototype._construct_rows = function () {
        var height = (this.options.height.split("px")[0] / this.dynprops.max_rows);
        for (var i = 0; i < this.dynprops.max_rows; i++) {

            $("<div class='gantt-row'></div>").css({
                position: "absolute",
                left: this.dynprops.label_width + "px",
                top: (i * height) + "px",
                width: this.width(),
                height: height + "px",
            }).appendTo(this.$el);
        }
        $(".gantt-row").hover(function () {
            $(this).css("background", "rgba(0,0,0,0.2)");
        }, function () {
            $(this).css("background", "transparent");
        });
    };

    Plugin.prototype._construct_tasks = function () {
        $("<div ganttr-id='label_container'></div>").css({
            position: "absolute",
            background: "lightgray",
            left: 0 + "px",
            top: 0 + "px",
            width: this.dynprops.label_width + "px",
            height: this.height() + "px",
        }).appendTo(this.$el);

        for (var task_id in this.tasks) {
            var task = this.tasks[task_id];
            $("<div id='task_" + task.id + "' class='gantt-task'></div>").css({
                 position: "absolute",
                background: "teal",
                left: task.x + "px",
                top: task.y + "px",
                width: task.width + "px",
                height: this.dynprops.task_height + "px",
            }).appendTo(this.$el);
        }
    };

    Plugin.prototype.get_new_id = function () {
        while (true) {
            var id = Math.random().toString(36).substring(7);
            if (!(id in this.tasks)) {
                return id;
            }
        }
    };

    Plugin.prototype.add_task = function (options) {
        // TODO
        // Add a whole row, not just the task box, with task label to the left
        // Only one task per row, move existing task box if row already has task
        // Add more rows and max rows if too many rows, and redraw

        var width = ~~(this.width() / 20),
            height = this.dynprops.task_height,
            x = options.x - width/2;

        if (x < this.dynprops.label_width) {
            x = this.dynprops.label_width;
        }

        var task = {
            id: this.get_new_id(),
            start_date: new Date(),
            end_date: (new Date()).setDate((new Date()).getDate() + 3),
            x: x,
            y: options.y,
            width: width,
        };

        $("<div id='task_" + task.id + "' class='gantt-task'></div>").css({
            position: "absolute",
            background: "teal",
            left: task.x + "px",
            top: task.y + "px",
            width: task.width + "px",
            height: this.dynprops.task_height + "px",
        }).appendTo(this.$el);

        this.tasks[task.id] = task;
    };

    Plugin.prototype.edit_task = function (task_id) {
        // TODO
        // Show a modal dialog window where you can edit a task's info
    };

    Plugin.prototype.export_png = function () {
        // TODO
        // Export html to png for download
    };

    Plugin.prototype.save = function () {
        // TODO
        // Save current diagram structure and tasks to localStorage
    };

    Plugin.prototype.load = function () {
        // TODO
        // Load a diagram from localStorage
    };

    // A really lightweight plugin wrapper around the constructor, 
    // preventing against multiple instantiations
    $.fn[pluginName] = function (options) {
        return this.each(function () {
            if (!$.data(this, "plugin_" + pluginName)) {
                $.data(this, "plugin_" + pluginName, 
                new Plugin( this, options ));
            }
        });
    }

})( jQuery, window, document );