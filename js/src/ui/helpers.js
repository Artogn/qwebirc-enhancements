

ui.setTitle = function(title, options) {
    if (options && options.alert) {
        ui.setTitleAlert(title, options);
    } else {
        document.title = title;
    }
};

ui.supportsFocus = function() {
    var result = (util.isMobile || Browser.name === "Konqueror") ?  [false, false] : [true];

    ui.supportsFocus = $lambda(result);
    return result;
};

util.NBSPCreate = function(text, element) {
    var e = text.split("  ");
    e.each(function(txt, i) {
        var tn = document.createTextNode(txt);
        element.appendChild(tn);

        if (i != e.length - 1) {
            var e2 = new Element("span", {"html": "&nbsp;&nbsp;"});
            element.appendChild(e2);
        }
    });
};

util.setCaretPos = Element.setCaretPosition;

util.setAtEnd = function($el) {
    util.setCaretPos($el, $el.value.length);
};

util.getCaretPos = Element.getCaretPosition;

//....
//TODO this is garbage
util.createInput = function(type, parent, name, selected, id) {
    var r;
    if (Browser.Engine.trident) {
        if (name) {
            name = " name=\"" + escape(name) + "\"";
        } else {
            name = "";
        }
        if (id) {
            id = " id=\"" + escape(id) + "\"";
        } else {
            id = "";
        }
        r = $(document.createElement("<input type=\"" + type + "\"" + name + id + " " + (selected ? " checked" : "") + "/>"));
    } else {
        r = new Element("input");
        r.type = type;
        if (name) r.name = name;
        if (id) r.id = id;

        if (selected) r.checked = true;
    }

    parent.appendChild(r);
    return r;
};

util.percentToPixel= function(data, par) {
    par = par || document.body;
    var size = par.getSize();
    return {
        x: size.x * (data.x / 100),
        y: size.y * (data.y / 100)
    };
}


ui.decorateDropdown = function(btn, ddm, options) {
    ddm.hideMenu = function() {
        if(options && options.onHide)
            options.onHide.call(this, ddm);
        return ddm.hide();
    };
    ddm.showMenu = function() {
        if(options && options.onShow)
            options.onShow.call(this, ddm);

        if (ddm.isDisplayed()) {
           ddm.hideMenu();
        } else {
            ddm.show();
            document.addEvent("click:once", ddm.hideMenu);
        }
        return ddm;
    };

    ddm.position.delay(50, ddm, {
        relativeTo: btn,
        position: {x: 'left', y: 'bottom'},
        edge: {x: 'left', y: 'top'}
    });

    btn.addEvent("click", function(e) {
            e.stop();
            ddm.showMenu();
        });
    return ddm.hideMenu();
};

//dirty function please help with css :(
//dir can be 'width' 'height'
util.fillContainer = function ($ele, options) {
    options = Object.append({style: ['width'], offset: 20}, options);

    var filler = function() {
        var size = $ele.getSize();

        Array.from( options.style ).each(function(style) {//wait a sec for potential style recalcs
            var method = style.contains('width') ? 'x' : 'y',
                offset = options.offset;

            $ele.getSiblings().each(function(sib) {
                offset += sib.getSize()[method];
            });

            $ele.setStyle(style, "calc(100% - " + offset + "px)");
        });
    }

    filler.delay(20);
    return $ele;
};

util.elementAtScrollPos = function($ele, pos, dir, offset) {
    dir = (dir || 'width').capitalize();
    offset = offset || 10;
    var $res = $ele.lastChild;
    Array.some($ele.childNodes, function($kid) {
        offset += $kid['get' + dir]();
        if(offset >= pos) {
            $res = $kid;
            return true;
        }
    });
    return $res;
};
