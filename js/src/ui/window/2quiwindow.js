
//mae view and qui and controller
ui.QUI.Window = new Class({
    Extends: ui.Window,
    Binds: ["close", "attach", "detach", "selectTab", "nickChange", "nickClick", "editTopic", "updatePrefix", "menuClick"],

    initialize: function(parentObject, client, type, name, identifier) {
        var self = this;
        self.parent(parentObject, client, type, name, identifier);

        var qwindow = self.window;

        self.events = {
            client: {}
        };

        qwindow.detached = self.detached = false;

        var $tab = self.tab = Element.from(templates.ircTab({
                'name': (name === BROUHAHA) ? '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' : name
            })).inject(parentObject.tabs),
            $tabDetach = $tab.getElement('.detach');

        if(name === BROUHAHA) {
            $tab.addClass('brouhaha');
            _.delay(function() {
                _.some(parentObject.windowArray, function(win) {
                    if(util.isChannelType(win.type) && !util.isBaseWindow(win.name)) {
                        self.properties.text(win.name); //update current channel in brouhaha
                        self.currentChannel = win.name;
                    }
                });
            }, 1000);
        }



        // var elchanid = document.getElementById('channel-name-id');

        $tab.addEvents({
                focus: $tab.blur,
                click: self.selectTab,
                dblclick: function(e) {
                    e.stop();

                    if (self.closed)
                        return;

                    parentObject.selectWindow(self);
                }
            })
            .store("window", self);

        $tabDetach.addEvent('click', self.detach);

        if (!isBaseWindow(name)) {
            var $tabclose = Element.from(templates.tabClose()),
                close = self.close;
            //close window

            $tabclose.addEvent("click", close);
            $tab.addEvent("mouseup", function(e) {
                    var button = Browser.Engine.trident ? 4 : 1;

                    if (e.event.button === button)
                        close(e);
                })
                .adopt($tabclose);
        }

        var lines = self.lines = qwindow.middle;
            lines.store("window", self);
        // self.parentObject.qjsui.applyClasses("middle", self.lines);
        if (type !== ui.WINDOW_CUSTOM && type !== ui.WINDOW_CONNECT) {
            qwindow.window.addClass('ircwindow');
                // .set('id', 'mainircwindow');
            self.fxscroll = new Fx.AutoScroll(lines, {
            });

            lines.store("fxscroll", self.fxscroll)
                .store("client", self.client);

        } else {
            qwindow.window.addClass(name.capitalize().replace(" ", "-"));//Connection Details -> Connection-Details
        }

        if (type === ui.WINDOW_CHANNEL) {
            qwindow.window.addClass('channel');

            qwindow.topic.html(templates.topicBar({topic:false}));
            var topic = self.topic = qwindow.topic;
            topic.addEvent("dblclick", self.editTopic);
            self.updateTopic("");

            var $nicklist = self.nicklist = qwindow.right;
            $nicklist.addClass("nicklist")
                    // .addEvent("click", self.removePrevMenu.bind(self))
                    .addEvent("click:relay(a.user)", self.nickClick)
                    .addEvent("focus:relay(a)", $nicklist.blur);


            var $divider = self.divider = Element.from(templates.verticalDivider())
                                                    .inject($nicklist, "before");
            //cant create splitpane here because elements are still hidden
        }

        var properties = self.properties = Element.from(templates.channelName({channel: name}))
                                                    .inject(qwindow.properties);

        if(util.windowNeedsInput(type))
            qwindow.bottom.appendChild(self.createInput());


        self.nicksColoured = self.parentObject.uiOptions2.get("nick_colours");
    },

    close: function(e) {
        if(e)
            e.stop();

        if (this.closed)
            return;

        if (isChannelType(this.type) && (!isBaseWindow(this.name))) {
            var client = this.client,
                channels = util.removeChannel(client.channels, this.name);

            client.exec("/PART " + this.name);
            client.storeChannels(channels);
        }
        if(this.client instanceof irc.IRCClient) 
            this.client.removeEvents(this.events.client);
        this.parent();

        this.parentObject.tabs.disown(this.tab);
        if(this.fxscroll)
            this.fxscroll.stop();
        if(this.resizable)
            this.resizable.detach().stop();
        if(this.drag)
            this.drag.detach().stop();

        if(this.detached) {
            this.wrapper.destroy();
        } else {

            this.window.window.destroy();
        }
    },

    attach: function(e) {
        var win = this.window.window,
            wrapper = this.wrapper,
            po = this.parentObject;

        this.window.detached = this.detached = false;

        wrapper.hide();
        win.hide();
        // wrapper.removeChild(win);
        win.replaces(wrapper);
        wrapper.destroy();

        this.drag.detach().stop();
        this.resizable.detach().stop();
        this.wrapper = this.resizable = this.drag = null;

        this.tab.show();
        this.select();

        this.fireEvent('attach');
    },

    detach: function(e) {
        var self = this,
            win = self.window.window,
            po = self.parentObject,
            qjsui = po.qjsui,

            wrapper = self.wrapper = Element.from(templates.detachedWindow({
                                                    'channel': this.name,
                                                    'base': util.isBaseWindow(this.name)
                                                })),
            header = wrapper.getElement('.header'),
            attach = header.getElement('.attach'),
            close = header.getElement('.tab-close'),

            resizeWrapper = Element.from(templates.resizeHandle()),
            resizeHandle = resizeWrapper.getElement('.resize-handle'),

            setActive = function(e) {
                po.windowArray.each(function(win) {
                    if(win.detached) win.wrapper.removeClass('active');
                });
                wrapper.addClass('active');
            };

        attach.addEvent('click', self.attach);
        if(close) {
            close.addEvent('click', self.close);
        }

        //change window if we're active
        if(self.active)
            po.nextWindow(1, self);

        var size = util.percentToPixel({x:40, y:60}, qjsui.parent);
        wrapper.setStyles({
                "width": size.x,
                "height": size.y
            })
            .wraps(win) //*** adds wrapper to dom
            .adopt(resizeWrapper);
        win.show()
            .addEvent("mousedown", Event.stopPropagation);//prevent draggin occurring while clickin window
        setActive();

        self.resizable = wrapper.makeResizable({
                                limit: {//min/max
                                    x: [400, null],
                                    y: [200, null]
                                },
                                handle: resizeHandle,
                                stopPropagation: true
                            });
        self.drag = wrapper.makeDraggable({
                                handle: wrapper,
                                includeMargins: true
                            });

        wrapper.addEvents({
            click: setActive
        });


        self.selectUpdates();

        // util.centerElement(wrapper, qjsui.parent);
        wrapper.position();

        self.detached = self.window.detached = true;

        //keeps order
        self.tab.hide();

        self.fireEvent('detach');
    },

    selectTab: function(e) {
        var self = this;
        if(self.name !== BROUHAHA) {
            _.each(self.parentObject.windowArray, function(win) {
                if(!win.detached && (!e || e.type !== "click" || win.name !== BROUHAHA)) {//keep brouhaha selected if its from a single click
                    win.tab.removeClass("tab-selected");
                }
                if(win.name === BROUHAHA) {
                    if(util.isChannelType(self.type)) {
                        win.properties.text(self.name); //update current channel in brouhaha
                        win.currentChannel = self.name;
                    }
                }
            });
        }
        irc.activeChannel = self.name;
        self.tab.removeClasses("tab-hilight-activity", "tab-hilight-us", "tab-hilight-speech")
                .addClass("tab-selected");
    },

    select: function() {
        this.selectTab();

        //changing windows occurs here
        this.parentObject.setWindow(this.window);

        this.parent();

        this.selectUpdates();
    },

    //styles and ui things to update
    selectUpdates: function() {
        var self = this,
            parentObject = self.parentObject;

        if(self.nicklist && !self.split) {
            // (function() { //wait a sec for the styles to be calculated
            //     self.split = new Drag.SplitPane(self.divider, {
            //         // store: new Storage('__panelwidth')
            //     });
            // }).delay(50);
        }

        if(self.fxscroll) {//scroll to bottom
            self.fxscroll.autoScroll();
        }

        //give focus on select
        // if (util.windowNeedsInput(self.type)) {
        //     self.$inputbox.focus();
        // }

        if(util.isChannelType(self.type)) {
            if (self.nicksColoured !== parentObject.uiOptions2.get("nick_colours")) {
                self.nicksColoured = parentObject.uiOptions2.get("nick_colours");

                var nodes = self.nicklist.childNodes;
                if (parentObject.uiOptions2.get("nick_colours")) {
                    _.each(nodes, function(node) {
                        var colour = util.toHSBColour(node.retrieve("nick"), self.client);
                        if ($defined(colour))
                            node.firstChild.setStyle("color", colour.rgbToHex());
                    });
                } else {
                    _.each(nodes, function(node) {
                        node.firstChild.setStyle("color", null);
                    });
                }
            }

            self.updatePrefix();
        }

    },

    deselect: function() {
        this.parent();
        this.tab.removeClass("tab-selected");
    },

    editTopic: function() {
        if (!this.client.nickOnChanHasPrefix(this.client.nickname, this.name, "@")) {
/*      var cmodes = this.client.getChannelModes(channel);
      if(cmodes.indexOf("t")) {*/
            return alert(lang.needOp.message); /*}*/
        }
        var newTopic = prompt(util.formatter(lang.changeTopicConfirm.message, {channel: this.name}), this.topic.topicText);
        if (!$defined(newTopic))
            return;

        this.client.exec("/TOPIC " + newTopic);
    },

    //creates the input box on the bottom
    createInput: function() {
        var self = this,
            parentO = self.parentObject,

            inputtype = Browser.isMobile ?  "mobile-input": "keyboard-input",

            nick = self.client.nickname,

            $form = Element.from(templates.ircInput({'nick': nick, 'status': '', type: inputtype})),
            $nicklabel = self.$nicklabel = $form.getElement('.nickname'),
            $inputbox = self.$inputbox = $form.getElement('.input-field'),
            $inputbtn = $form.getElement('.send');


        if (Browser.isMobile) {
            $inputbtn.addClass("mobile-button");
        }

        var resettab = parentO.resetTabComplete,
            complete = function(e) {
                var resultfn;
                var cvalue = $inputbox.val();

                if (e.key === "up") {
                    resultfn = self.commandhistory.upLine;
                } else if (e.key === "down") {
                    resultfn = self.commandhistory.downLine;
                } else if (e.key === "tab" && !e.ctrl) {
                    e.stop();
                    return self.tabComplete($inputbox);
                } else {
                    return parentO.resetTabComplete();
                }
                e.stop();

                parentO.resetTabComplete();
                if ((!!cvalue) && (self.lastcvalue !== cvalue))
                    self.commandhistory.addLine(cvalue, true);

                var result = resultfn.call(self.commandhistory);

                if (!result)
                    result = "";
                self.lastcvalue = result;

                $inputbox.val(result);
                util.setAtEnd($inputbox);
            };

        if(isChannelType(self.type)) {
            var e = self.events.client.mode = self.updatePrefix;
            self.client.addEvents({
                "mode": e
            });
        }

        $nicklabel.addEvent("dblclick", function() {
            var nick = prompt("Enter a new nickname", self.nickname);
            if(nick) {
                self.client.exec("/nick " + nick);
            }
        });

        $inputbtn.addEvent("click", self.sendInput);
        $form.addEvent("submit", self.sendInput);
        $inputbox.addEvents({
                    "focus": resettab,
                    "mousedown": resettab,
                    "keydown": complete
                    });
        return $form;
    },

    updatePrefix: function (data) {
        var prefix;
        if(data) {
            if(!data.thisclient || data.channel !== this.name)
                return;
            else
                prefix = data.prefix;
        } else {
            prefix = this.client.getNickStatus(this.name, this.client.nickname)
        }
        this.$nicklabel.getElement('.status')
                        .removeClasses('op', 'voice')
                        .addClass((prefix === OPSTATUS) ? "op" : (prefix === VOICESTATUS) ? "voice" : "")
        // util.fillContainer(this.$inputbox);
    },

    nickClick: function(evt, $tar) { //delegation to nick items
        var hasMenu = $tar.hasClass('selected-middle');

        this.removePrevMenu(); //collapse old menus
        if (!hasMenu) {
            this.moveMenuClass($tar);
            $tar.addClass("selected")
                .store("menu", this.createMenu($tar.retrieve("nick"), $tar));
        }
    },

    // - clicking user in nick list
    createMenu: function(nick, $parent) {
        var pmenu = $parent.retrieve('menu');
        if(pmenu) {
            return pmenu.toggle();
        }

        var $menu = Element.from(templates.menuContainer()),
            self = this;

        _.chain(ui.MENU_ITEMS)
            .filter(function(item) {
                return Type.isFunction(item.predicate) ? item.predicate.call(self, nick) : !!item.predicate;
            })
            .each(function(item) {
                Element.from(templates.nickbtn({'nick': "- " + item.text}))
                        .store("action", item.fn)
                        .inject($menu);
            });

        $menu.addEvent('click:relay(.user)', function(e, target) {
                e.stop();
                self.menuClick(target.retrieve("action"));
            })
            .addEvent('focus:relay(a)', Element.prototype.blur)
            .inject($parent);

        return $menu;
    },

    menuClick: function(fn) {
        var selected = this.nicklist.getElement('.selected');
        //i dont understand why these arent equivalent
        fn.call(this, selected.retrieve("nick"));
        this.removePrevMenu();
    },

    moveMenuClass: function($sel) {
        $sel = $($sel) || this.nicklist.getElement('.selected-middle, .selected');
        if (this.nicklist.firstChild === $sel) {
            $sel.removeClass("selected-middle");
        } else if($sel) {
            $sel.addClass("selected-middle");
        }
    },

    removePrevMenu: function() {
        var $sel = this.nicklist.getElements('.selected-middle, .selected');
        if ($sel) {
            $sel.removeClasses("selected", "selected-middle");
            var $menu = $sel.retrieve('menu');
            if ($menu) {
                $menu.dispose();
                $sel.eliminate('menu');
            }
        }
    },

    updateTopic: function(topic) {
        var topice = this.topic.empty();

        topice.topicText = topic;
        if (topic) {
            this.parent(topic, topice);
        } else {
            topice.html(templates.topicText({topic:lang.noTopic.message, empty:true}));
        }
    },

    addLine: function(type, line, colourClass) {
        var $msg = Element.from(templates.ircMessage({ type: type.toLowerCase() }));

        if(colourClass)
            $msg.addClass(colourClass);

        this.parent(type, line, colourClass, $msg);
    },
    highlightTab: function(state) {
        this.parent(state);

        if (state == this.hilighted)
            return;

        this.tab.removeClasses("tab-hilight-activity", "tab-hilight-us", "tab-hilight-speech");

        switch (state) {
        case ui.HILIGHT_US:
            this.tab.addClass("tab-hilight-us");
            break;
        case ui.HILIGHT_SPEECH:
            this.tab.addClass("tab-hilight-speech");
            break;
        case ui.HILIGHT_ACTIVITY:
            this.tab.addClass("tab-hilight-activity");
            break;
        }
    }
});
