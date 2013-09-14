this["qwebirc"] = this["qwebirc"] || {};
this["qwebirc"]["templates"] = this["qwebirc"]["templates"] || {};

this["qwebirc"]["templates"]["welcome-pane"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, stack2, self=this, functionType="function", escapeExpression=this.escapeExpression;

function program1(depth0,data) {
  
  
  return "Before you login please enable desktop notifications <a class=\"enable-notifications btn btn-danger btn-small\" href=\"#\">Enable notifications</a>";
  }

function program3(depth0,data) {
  
  var buffer = "", stack1, stack2;
  buffer += "Your browser does not support desktop notifications. Consider installing";
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.Browser),stack1 == null || stack1 === false ? stack1 : stack1.ie), {hash:{},inverse:self.program(6, program6, data),fn:self.program(4, program4, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  return buffer;
  }
function program4(depth0,data) {
  
  
  return " <a href=\"http://www.google.com/chromeframe/?prefersystemlevel=true\">Chrome frame for Internet Explorer</a>";
  }

function program6(depth0,data) {
  
  var stack1, stack2;
  stack2 = helpers['if'].call(depth0, ((stack1 = depth0.Browser),stack1 == null || stack1 === false ? stack1 : stack1.firefox), {hash:{},inverse:self.program(9, program9, data),fn:self.program(7, program7, data),data:data});
  if(stack2 || stack2 === 0) { return stack2; }
  else { return ''; }
  }
function program7(depth0,data) {
  
  
  return " <a href=\"https://addons.mozilla.org/en-US/firefox/addon/tab-notifier/\">the Firefox Tab-notifier extension</a>";
  }

function program9(depth0,data) {
  
  var buffer = "";
  buffer += "an extension to add <a href=\"http://caniuse.com/notifications\">Desktop notifications</a>";
  return buffer;
  }

function program11(depth0,data) {
  
  
  return "<div class=\"controls\"><p>Also check out the new options <a class=\"btn btn-default btn-small\" href=\"#!options\">Options</a></p></div>";
  }

  buffer += "<div class=\"alert alert-block fade in\"><button type=\"button\" class=\"close\" data-trigger=\"nix\" data-nix-options=\"'target': '!div.alert'\">×</button><h4>Welcome to "
    + escapeExpression(((stack1 = ((stack1 = depth0.options),stack1 == null || stack1 === false ? stack1 : stack1.appTitle)),typeof stack1 === functionType ? stack1.apply(depth0) : stack1))
    + "</h4><div class=\"controls\"><p>";
  stack2 = helpers['if'].call(depth0, ((stack1 = ((stack1 = depth0.Browser),stack1 == null || stack1 === false ? stack1 : stack1.Features)),stack1 == null || stack1 === false ? stack1 : stack1.notifications), {hash:{},inverse:self.program(3, program3, data),fn:self.program(1, program1, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</p></div>";
  stack2 = helpers['if'].call(depth0, depth0.firstvisit, {hash:{},inverse:self.noop,fn:self.program(11, program11, data),data:data});
  if(stack2 || stack2 === 0) { buffer += stack2; }
  buffer += "</div>";
  return buffer;
  });