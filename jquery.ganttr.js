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
    var pluginName = "ganttr",
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
        this.rows = [];

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
            if ($obj.attr("class") === "ganttr-row") {
                var x = event.offsetX + plugin.dynprops.label_width,
                    y = $obj.css("top").split("px")[0];

                plugin.add_task({ 
                    x: x,
                    y: y,
                    row: $obj.attr("row"),
                });
            } else if ($obj.attr("class") === "ganttr-task") {
                plugin.edit_task($obj.attr("id").split("_")[1]);
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
        this.dynprops.task_height = this.height() / this.dynprops.max_rows;

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

        this.$el.empty().removeClass().addClass("ganttr-canvas").attr("ganttr-id", "canvas").css({
            width: this.options.width,
            height: this.options.height,
        });
    };

    Plugin.prototype._construct_timelines = function () {
        // Add the vertical lines indicating dates

        var date_pos = [],
            line_count = 5,
            width_num = this.width() - dynprops.label_width,
            distance = width_num / line_count;

        for (var i = 1; i < line_count; i++) {
            var pos = parseInt(i * distance + dynprops.label_width, 10);
            date_pos.push(pos);

            $("<div class='ganttr-timeline'></div>").css({
                left: "" + pos + "px",
                top: "10px",
                width: 0,
                height: (this.options.height.split("px")[0] - 20) + "px",
            }).appendTo(this.$el);
        }
    };

    Plugin.prototype._construct_rows = function () {
        var height = this.dynprops.task_height;

        for (var i = 0; i < this.dynprops.max_rows; i++) {
            this.rows.push({
                task: undefined,
                y: (i * height),
            });

            $("<div class='ganttr-row' row='"+i+"'></div>").css({
                left: this.dynprops.label_width + "px",
                top: (i * height) + "px",
                width: this.width(),
                height: height + "px",
            }).appendTo(this.$el);
        }
    };

    Plugin.prototype.construct_task = function (task_id) {
        var task = this.tasks[task_id];
        $("#task_" + task_id).remove();

        var label = $("<div id='task_label_" + task.id + "' class='ganttr-task-label'>" + task.title + "</div>").css({
            left: 0,
            width: (this.dynprops.label_width - 10) + "px",
            height: this.dynprops.task_height + "px",
        });

        var task_box = $("<div id='task_box_" + task.id + "' class='ganttr-task-box'></div>").css({
            left: task.x + "px",
            top: 0,
            width: task.width + "px",
            height: this.dynprops.task_height + "px",
        });

        var task_el = $("<div id='task_" + task.id + "' class='ganttr-task'></div>").css({
            left: 0,
            top: task.y + "px",
            width: this.width() + "px",
            height: this.dynprops.task_height + "px",
        });


        label.appendTo(task_el);
        task_box.appendTo(task_el);
        task_el.appendTo(this.$el);
    }

    Plugin.prototype._construct_tasks = function () {
        $("<div ganttr-id='label_container' class='ganttr-label-container'></div>").css({
            left: 0 + "px",
            top: 0 + "px",
            width: this.dynprops.label_width + "px",
            height: this.height() + "px",
        }).appendTo(this.$el);

        for (var task_id in this.tasks) {
            this.construct_task(task_id);
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

    Plugin.prototype.open_modal = function (options) {
        if (!$("#ganttr-modal").length) {
            var width = this.width()/2,
                height = this.height()/2;

            $("<div id='ganttr-modal' class='ganttr-modal'></div>").css({
                left: (this.width()/2 - width/2) + "px",
                top: (this.height()/2 - height/2) + "px",
                width: width + "px",
                height: height + "px",
                display: "none",
            }).appendTo(this.$el);
        }

        var $modal = $("#ganttr-modal");

        if (options.type === "edit") {
            if (!$modal.find(".edit").length) {

                $(
                    "<div class='edit'>" +
                        "<div><input type='text' id='edit_task_title' placeholder='Task title' /></div>" +
                        "<div><input type='date' id='edit_task_start' placeholder='Start date' /></div>" +
                        "<div><input type='date' id='edit_task_end' placeholder='End date' /></div>" +
                        "<div><input type='button' onclick='$(\"#ganttr-modal\").hide()' value='Done' /></div>" +
                    "</div>"
                ).css({
                    width: "100%",
                    height: "100%",
                    display: "none",
                }).appendTo($modal);
            }


            $modal
                .show()
                .find(".edit").show();
        }
    };

    Plugin.prototype.add_task = function (options) {
        // TODO
        // Add a whole row, not just the task box, with task label to the left
        // Only one task per row, move existing task box if row already has task
        // Add more rows and max rows if too many rows, and redraw

        var width = ~~(this.width() / 20),
            height = this.dynprops.task_height,
            x = options.x - width/2,
            row = options.row;

        if (x < this.dynprops.label_width) {
            x = this.dynprops.label_width;
        }

        if (this.rows[row].task != undefined) {
            this.edit_task(this.rows[row].task);
            return;
        }

        var task = {
            id: this.get_new_id(),
            title: "Unnamed task",
            start_date: new Date(),
            end_date: (new Date()).setDate((new Date()).getDate() + 3),
            x: x,
            y: options.y,
            width: width,
            row: row,
        };

        this.tasks[task.id] = task;
        this.rows[row].task = task.id;

        this.construct_task(task.id);
        this.edit_task(task.id);
    };

    Plugin.prototype._apply_task_change = function (task_id, key, val) {
        this.tasks[task_id][key] = val;
        this.construct_task(task_id);
    };

    Plugin.prototype.edit_task = function (task_id) {
        // TODO
        // Show a modal dialog window where you can edit a task's info

        this.open_modal({ type: "edit" });

        var task = this.tasks[task_id],
            plugin = this;

        $("#edit_task_title").val(task.title)
            .keyup(function () { plugin._apply_task_change(task_id, "title", $(this).val()); });
        $("#edit_task_start").val(task.start_date)
            .change(function () { plugin._apply_task_change(task_id, "start_date", $(this).val()); });
        $("#edit_task_end").val(task.end_date)
            .change(function () { plugin._apply_task_change(task_id, "end_date", $(this).val()); });

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