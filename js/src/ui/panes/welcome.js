/**
 *  welcome view
 *
 *  @depends [panes/PanelView, util/ToggleNotifications]
 *  @provides [panes/Welcome]
 */
ui.WelcomePane = new Class({
    Extends: PanelView,
    options: {
        pane: "welcome-pane",
        i18n: "welcome",
        events: {
            "click:relay(.enable-notifications)": "enableNotifications",
            "click:relay(.controls)": "controlClick"
        },
        onEnableNotifications: function() {
            /* global toggleNotifications */
            toggleNotifications(this.ui.uiOptions, true, true);
        },
        onControlClick: function(e, controls) {
            controls.dispose();
            if(!this.element.getElement(".controls")) this._close();
        }
    },
    initialize: function(ui, options) {
        this.ui = ui;
        this.parent(options);
    },
    getData: function() {
        return _.extend({}, this.options, {
            Browser: window.Browser
        });
    }
})
.extend({
    show: function(_ui, options) {//determines if needs to be shown and shows
        if(options.firstvisit || notify.permissionLevel() !== notify.PERMISSION_GRANTED) {
            options.element = new Element("div.welcome").inject(options.element);
            return new ui.WelcomePane(_ui, options);
        }
    }
});