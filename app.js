//add backbone, mustache templating, firebase, or angular, use less, use require/common js, sass, prefix-free, browserify, grunt, bower, handlebars
	//need an actual object backbone model
	//per user todo lists -> multiple todo lists per user
		function deleteTask(){
 			$("li").click(function(){
 				var item = $(this)
    			$(item).hide();
  			});
		}
		
		function done(){
			$("li").click(function(){
				$(this).wrap("<strike>");
			});
		}
		$(document).ready(function() {
			var base = new Firebase("https://simple-todo-list.firebaseio.com");
			base.on('child_added', function(snapshot) {
			  var message = snapshot.val();
			  addTask(message,snapshot.name())
			});
			base.on('child_removed', function(snapshot) {
				$("[data-id=" + snapshot.name() +"]").remove();
			})
			base.on('child_changed', function(snapshot,prevSnap) {
				var li = $("[data-id=" + snapshot.name() + "]")
				//need better efficiency; move recreating label to after pressing enter instead of when child_changed, compare strings make sure it actually changed too 
				li.html("<span class=\"trash\"></span><span class='todoItem'><input class='check' type=\"checkbox\" /><span class='taskText'></span></span>")
				li.find('.taskText').text(snapshot.val().text);
				if(snapshot.val().completed) {
					var appendedItem = li;
					appendedItem.find('.taskText').toggleClass("strikethrough");
					appendedItem.toggleClass("selected")
					appendedItem.find('.check').prop('checked',true);
				}
				
			})
			function addTask(m,id) { 
				var input = m.text;
				if(input.length > 0) {
					var appendedItem = $("<li></li>").html("<span class=\"trash\"></span><span class='todoItem'><input class='check' type=\"checkbox\" /><span class='taskText'></span></span>");
					appendedItem.find('.taskText').text(input);
					appendedItem.attr('data-id',id)
					$(".newTask").val('');
					$("ul").append(appendedItem);
					if(m.completed) {
						appendedItem.find('.taskText').toggleClass("strikethrough");
						appendedItem.toggleClass("selected")
						appendedItem.find('.check').prop('checked',true);
					}
					
				}
			}
			$('#taskForm').submit(function() {
				var input = $(".newTask").val();
				base.push({"text":input,"completed":false})
				return false;
			});
			$('ul').on('keypress focusout','.editTodo', function(e) {
				if(e.keyCode && e.keyCode != 13) { //if keycode exists, meaning its a keyboard event, and it doesn't equal 13, exit, otherwise it's focusout or 13
					return;
				}
				var text = $(this).val();
				var li = $(this).parent();
				var id = li.attr('data-id');
				base.child(id).child('text').set(text);
			})
			$('ul').on('click','.todoItem',function() {
				var item = $(this).parent();
				var id = item.attr("data-id")
				var completed = $(this).find('.taskText').hasClass("strikethrough");
				base.child(id).child("completed").set(!completed)
			});
			$('ul').on('dblclick','li',function(e) {
					var text = $(this).find('.taskText').text()
					$(this).html("<input type='text' class='editTodo'>")
					$(this).find('.editTodo').val(text)
					$(this).find('.editTodo').focus()
					e.stopImmediatePropagation();
			});
			function deleteItem(item) {
				base.child(item.attr("data-id")).remove();
			}
			$("ul").on('click', '.trash', function() {
				deleteItem($(this).parent());
			})
			$(".delete").on('click',function(){
				$("li").each(function(){
					if($(this).find('.taskText').hasClass("strikethrough")) {
						deleteItem($(this))
					}
				})
			});
	});
