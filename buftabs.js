"use strict";
XML.ignoreWhitespace = false;
XML.prettyPrinting = false;
var INFO =
<plugin name="buftabs" version="1.1.0"
    href="https://github.com/grassofhust/buftabs"
    summary="Buftabs: show the tabbar in the statusline"
    xmlns={NS}>
    <author email="lucas@glacicle.org" href="http://git.glacicle.org/vimperator-buftabs/">Lucas de Vries</author>
    <author email="frederick.zou@gmail.com">Yang Zou</author>
    <license href="http://sam.zoy.org/wtfpl/">WTFPL</license>
    <project name="Pentadactyl" minVersion="1.0"/>
    <p>
        When the script is loaded it hijacks the statusline to display a
        list of tabs, you can use the <o>buftabs</o> option to toggle it
        on or off.
    </p>

    <p>
        Use the BufTab, BufTabAlternate, BufTabSelected and BufTabs highlight groups to style the
        buftabs. Make sure you have called the "loadplugins" command
        before using the highlight groups in your vimperatorrc.
    </p>

    <p>
        You can set the max length of a title before it is cut off with
        the <o>buftabs-maxlength</o> option. It is set to 13 by default.
    </p>
    <p>
        Thanks Lucas de Vries and other folks on vimperator/dactyl. This plugins was initial developed by Lucas de Vries.
    </p>
    <item>
        <tags>'bt' 'buftabs'</tags>
        <spec>'buftabs' 'bt'</spec>
        <type>boolean</type> <default>true</default>
        <description>
            Toggle buftabs on or off.
        </description>
    </item>
    <item>
        <tags>'btr' 'buftabs-rnu'</tags>
        <spec>'buftabs-rnu' 'btr'</spec>
        <type>boolean</type> <default>false</default>
        <description>Relative tabnumber.</description>
    </item>
    <item>
        <tags>'btp' 'buftabs-progress'</tags>
        <spec>'buftabs-progress' 'btp'</spec>
        <type>boolean</type> <default>true</default>
        <description>Toggle progressbar on or off.</description>
    </item>
    <item>
        <tags>'btm' 'buftabs-maxlength'</tags>
        <spec>'buftabs-maxlength' 'btm'</spec>
        <type>number</type> <default>13</default>
        <description>
            The maximum length in characters of a single entry in the buftabs line.
            Set to 0 for unlimited.
        </description>
    </item>
    <item>
        <tags>'bte' 'buftabs-elem'</tags>
        <spec>'buftabs-elem' 'bte'</spec>
        <type>charlist</type> <default>"nthb"</default>
        <description>
            <p>Define which sections are shown.</p>
        <p>Supported characters:</p>

        <dl dt="width: 6em;">
            <dt>i</dt>      <dd>Favicon</dd>
            <dt>n</dt>      <dd>Tabnumber</dd>
            <dt>t</dt>      <dd>Tab title</dd>
            <dt>h</dt>      <dd>Forward/Backward indicator</dd>
            <dt>b</dt>      <dd>Heart indicator</dd>
        </dl>
        </description>
    </item>
    <item>
        <tags>'bts' 'buftabs-morestring'</tags>
        <spec>'buftabs-morestring' 'bts'</spec>
        <type>number</type> <default>"..."</default>
        <description>
            Trailing string when title longer than maxlength.
            Set to empty string for no trailing string.
        </description>
    </item>
    <item>
      <tags>:bt :buftabs</tags>
      <strut/>
      <spec>:buftabs</spec>
      <description>
        <p>Toggle buftabs on or off.</p>
      </description>
    </item>
    <p>There are four highlight groups: BufTab, BufTabSelected, BufTabAlternate and BufTabs</p>

    <dl dt="width: 12em;">
        <dt>BufTab</dt>                 <dd>Tabs</dd>
        <dt>BufTabSelected</dt>         <dd>Selected Tab</dd>
        <dt>BufTabAlternate</dt>        <dd>Previously selected tab</dd>
        <dt>BufTabs</dt>                <dd>Buftabs itself</dd>
    </dl>

    <p>Recommend Settings:</p>
    <ul>
        <li>hi -a BufTabSelected                            background-repeat:no-repeat; background-size:contain, contain; background-position: 4px top; color:#FFF; background-color:#000; padding:0 4px; font-weight:normal;border-radius:2px;</li>
        <li>hi -a BufTabAlternate                           background-repeat:no-repeat; background-size:contain, contain; background-position: 4px top; padding:0 4px; cursor:pointer !important;</li>
        <li>hi -a BufTab                                    background-repeat:no-repeat; background-size:contain, contain; background-position: 4px top; padding:0 4px; cursor:pointer !important;</li>
        <li>hi -a BufTab:hover                              color:#2e3330;background-color: #88b090; border-radius:2px;</li>
        <li>hi -a BufTabAlternate:hover                     color:#2e3330;background-color: #88b090; border-radius:2px;</li>
    </ul>
    <p><em>Buftabs does not support firefox 3.6.</em></p>
</plugin>;

let buftabs = {
    id : 'dactyl-statusline-field-buftabs',
    fullLoad: false,
    init : function () {
        if (buftabs.options['buftabs']) {
            if (document.getElementById(buftabs.id))
                commandline.widgets.updateVisibility();
            else {
                let widget = util.xmlToDom(
                    <hbox xmlns={XUL} highlight="BufTabs" id={buftabs.id} flex="1" valign="middle"/>,
                    document);
                statusline.widgets.url.parentNode.insertBefore(widget, statusline.widgets.url.nextSibling);
                commandline.widgets.addElement({
                        name: "buftabs",
                        getGroup: function () this.statusbar,
                        getValue: function () statusline.visible && buftabs.options['buftabs'],
                        noValue: true
                });
                commandline.widgets.statusbar.buftabs.addEventListener("DOMMouseScroll", function(event) {
                        gBrowser.tabContainer.advanceSelectedTab(event.detail < 0 ? -1 : 1, true);
                        event.stopPropagation();
                    }, true);

                buftabs.toggleProgressBar();
            }
            registerMyListener();
            buftabs.update();
        } else
            buftabs.destory();
        buftabs.fullLoad = true;
    },

    setup: function() {
        buftabs.fullLoad = true;
        dactyl.execute('set buftabs!');
    },

    destory: function() {
        unregisterMyListener();
    },

    get options() buftabs._options || {'maxlength':13, 'elem':'nthb', 'morestring':UTF8('...'), 'buftabs': true, 'rnu': false, 'progress': true},
    set options(options) {
        buftabs._options = {
            'maxlength': 'maxlength' in options ? options['maxlength'] : buftabs.options['maxlength'],
            'elem' : 'elem' in options ? options['elem'] : buftabs.options['elem'],
            'morestring': 'morestring' in options ? options['morestring'] : buftabs.options['morestring'],
            'buftabs': 'buftabs' in options ? options['buftabs'] : buftabs.options['buftabs'],
            'rnu': 'rnu' in options ? options['rnu'] : buftabs.options['rnu'],
            'progress': 'progress' in options ? options['progress'] : buftabs.options['progress']
        };
        if (buftabs.fullLoad) // window has fully loaded
            buftabs.init();
    },

    get btabs() commandline.widgets.statusbar.buftabs,

    get blabels() buftabs.btabs.childNodes,

    get curLabelIndex() buftabs._curLabelIndex,

    set curLabelIndex(value) {
        buftabs._curLabelIndex = value;
    },

    Otab : function (arg) {
        if (typeof arg == 'object')
            return arg;
        return gBrowser.tabs[arg];
    },

    mb_strlen: function (str) {
        let m=encodeURIComponent(str).match(/%[89ABab]/g);
        let extra_length = m ? m.length / 3 : 0;
        return str.length + extra_length;
    },

    mb_substr: function(str, length) {
        let i = 0;
        let overflow = false;
        let plength = 0;
        while (!overflow) {
            plength = buftabs.mb_strlen(str.substr(0, i));
            if (plength >= length)
                overflow = true;
            i = i + 1;
        }
        return str.substr(0, i).replace(/^\s+|\s+$/g, "");
    },

    Obrowser: function(arg) {
        if (typeof arg == 'object') // a label obj
            return arg;
        return gBrowser.getBrowserAtIndex(arg);
    },
    Olabel: function (arg) {
        if (typeof arg == 'object')
            return arg;
        return buftabs.blabels[arg];
    },

    Oposition: function (arg) {
        let label = arg;
        if (typeof arg != 'object')
            label = buftabs.Olabel(arg);
        return label.getBoundingClientRect();
    },

    Onavigation : function (arg) {
        let tab = arg;
        if (typeof arg != 'object')
            tab = buftabs.Otab(arg);
        let browser = tab.linkedBrowser;
        // history
        if (browser.webNavigation) {
            let sh = browser.webNavigation.sessionHistory;
            if (sh && (sh.index > 0) && (sh.index < sh.count - 1))
                return  UTF8("↔");
            if (sh && (sh.index < sh.count - 1) && (sh.index == 0))
                return UTF8("→");
            if (sh && (sh.index >= sh.count - 1) && (sh.index > 0))
                return UTF8("←");
        }
        return "";
    },

    setFavicon : function (aLabel, aTab) {
        let label = buftabs.Olabel(aLabel);
        let tab = buftabs.Otab(aTab);
        let image = tab.image;
        if (tab.linkedBrowser.webProgress.isLoadingDocument)
            image = "chrome://browser/skin/tabbrowser/connecting.png";
        if (image == "")
            image = DEFAULT_FAVICON;

        label.style.paddingLeft="21px";
        label.style.backgroundImage='url("'+image+'")';
    },

    removeFavicon : function (arg) {
        let label = buftabs.Olabel(arg);
        label.style.paddingLeft="4px";
        label.style.backgroundImage='none';
    },

    showFavicons : function () {
        buftabs.blabels.foreach(function (label) buftabs.setFavicon(label));
        buftabs.layout();
    },

    // layout
    layout: function () {
        // Scroll
        let position = buftabs.Oposition(buftabs.curLabelIndex);
        let first_position = buftabs.Oposition(0);
        let last_position = buftabs.Oposition(buftabs.blabels.length - 1);
        let btabs_position = buftabs.btabs.getBoundingClientRect();

        let next_position = false;
        if (buftabs.curLabelIndex + 1 < buftabs.blabels.length)
            next_position = buftabs.Oposition(buftabs.curLabelIndex + 1);

        let prev_position = false;
        if (buftabs.curLabelIndex > 0)
            prev_position = buftabs.Oposition(buftabs.curLabelIndex - 1);

        if (next_position) {
            if (next_position['right'] >= btabs_position['right'])
                buftabs.btabs.scrollLeft = next_position['right'] + btabs_position['left'] - first_position['left'] - btabs_position['right'];
        } else {
            if (position['right'] >= btabs_position['right'])
                buftabs.btabs.scrollLeft = position['right'] + btabs_position['left'] - first_position['left'] - btabs_position['right'];
        }

        if (prev_position) {
            if (prev_position['left'] <= btabs_position['left'])
                buftabs.btabs.scrollLeft = prev_position['left'] - first_position['left'];

        } else {
            if (position['left'] <= btabs_position['left'])
                buftabs.btabs.scrollLeft = 0;
        }

        // Show the entire line if possible
        if (buftabs.btabs.scrollWidth == buftabs.btabs.clientWidth)
            buftabs.btabs.scrollLeft = 0;

    },

    buildContainer: function () {
        let container = util.xmlToDom(
            <hbox xmlns={XUL} flex="0" tooltiptext="">
                <xul:image flex="0" key="image" class="plain show buftabs-image" />
                <xul:label flex="0" key="tabnumber" class="plain show buftabs-tabnumber" />
                <xul:label flex="0" key="indexnumber" class="plain show buftabs-indexnumber" />
                <xul:label flex="0" key="info" class="plain show buftabs-info" />
                <xul:label flex="0" key="history" class="plain show buftabs-history" />
                <xul:label flex="0" key="bookmark" class="plain show buftabs-bookmark" />
            </hbox>,
            document);
        return container;
    },

    obtainElements: function (container) {
        let nodes = container.childNodes;
        for each (let node in nodes) {
            object[node.key] = node;
        }
    },

    toggleProgressBar: function () {
        commandline.widgets.addElement({
                name: "progress",
                getGroup: function () this.statusbar,
                getValue: function () buftabs.options['progress'] || !buftabs.options['buftabs'],
                noValue: true
        });
    },

    buildLabels: function () {
        // Get buftabbar
        let btabs = buftabs.btabs;
        let visibleTabs_length = gBrowser.visibleTabs.length;

        // Make sure we have an appropriate amount of labels
        while (btabs.childNodes.length > visibleTabs_length)
            btabs.removeChild(btabs.lastChild);

        while (btabs.childNodes.length < visibleTabs_length) {
            let label = document.createElement("label");
            btabs.appendChild(label);
            label.addEventListener("mouseover", function(ev) {
                buftabs.updateLabelTooltip(this, this.tabindex);
            }, false);
            label.addEventListener("click", function (ev) {
                    if (ev.button == 0)
                        gBrowser.selectTabAtIndex(this.tabpos);
                    else if (ev.button == 1) {
                        if (gBrowser.visibleTabs[this.tabpos + 1])
                            gBrowser.tabContainer.selectedItem = gBrowser.visibleTabs[this.tabpos + 1]; // conflict with tab-option.js?
                        gBrowser.removeTab(gBrowser.tabContainer.getItemAtIndex(this.tabindex));
                    }
            }, false);
        }
    },
    // Update the tabs
    update : function () {
        if (!buftabs.options["buftabs"])
            return;

        buftabs.buildLabels();

        let visibleTabs = gBrowser.visibleTabs;
        // Create the new tabs
        for (let [i, tab] in iter(visibleTabs)) {
            // Create label
            let label = buftabs.Olabel(i);

            // Fill label
            label.tabpos = i;
            label.tabindex = gBrowser.tabContainer.getIndexOfItem(tab);

            buftabs.fillLabel(label, tab);
        }

        buftabs.curLabelIndex = tabs.index(null, true);
        buftabs.layout();

    },

    updateTabOpen: function (aEvent) {
        buftabs.update();
    },

    updateTabHide: function (aEvent) {
        buftabs.update();
    },

    updateTabMove: function (aEvent) {
        buftabs.update();
    },

    updateTabSelect: function (aEvent) {
        buftabs.update();
    },

    updateTabClose: function (aEvent) {
        if (!buftabs.options["buftabs"])
            return;

        buftabs.buildLabels();

        let visibleTabs = gBrowser.visibleTabs;
        let closed_labelIndex = gBrowser.tabContainer.getIndexOfItem(aEvent.target);
        // Create the new tabs
        for (let [i, tab] in iter(visibleTabs)) {
            // Create label
            let label = buftabs.Olabel(i);

            // Fill label
            label.tabpos = i;
            label.tabindex = gBrowser.tabContainer.getIndexOfItem(tab);
            if (label.tabindex > closed_labelIndex) // dirty hack, I don't know why
                label.tabindex = label.tabindex - 1;

            buftabs.fillLabel(label, tab);
        }

        buftabs.curLabelIndex = tabs.index(null, true);
        buftabs.layout();

    },

    updateTabAttrModified: function(aEvent) {
        if (!aEvent.target.hidden) {
            let tab = aEvent.target;
            let labelindex = tabs.index(tab, true);
            buftabs.fillLabel(labelindex, tab);
            dactyl.timeout(buftabs.layout, 500);
        }
    },

    // fill a label
    fillLabel: function(arglabel, argtab) {
        let label = buftabs.Olabel(arglabel);
        let tab = buftabs.Otab(argtab);
        let browser = tab.linkedBrowser;
        let maxlength = parseInt(buftabs.options['maxlength']);
        let morestring = buftabs.options['morestring'];
        let tabvalue = "";

        // Get title
        if (buftabs.options['elem'].indexOf('t') >= 0)
            tabvalue += tab.label;

        // Check length
        if (maxlength > 0 && tabvalue.length > maxlength)
            tabvalue = buftabs.mb_substr(tabvalue, maxlength - morestring.length) + morestring;

        // Get history
        if (buftabs.options['elem'].indexOf('h') >= 0)
            tabvalue += buftabs.Onavigation(tab);

        // Bookmark icon
        if (buftabs.options['elem'].indexOf('b') >= 0 && bookmarkcache.isBookmarked(browser.contentDocument.location.href))
            tabvalue += UTF8("❤");

        // Brackets and index
        if (buftabs.options['elem'].indexOf('n') >= 0) {
            if (buftabs.options['rnu']) {
                if (tabvalue.length > 0)
                    tabvalue = (label.tabpos + 1)+"-"+tabvalue;
                else
                    tabvalue = label.tabpos + 1;
            } else {
                if (tabvalue.length > 0)
                    tabvalue = (label.tabindex + 1)+"-"+tabvalue;
                else
                    tabvalue = label.tabindex + 1;
            }
        }

        label.setAttribute("value", tabvalue);
        // tabbrowser getIcon
        if (buftabs.options['elem'].indexOf('i') >= 0)
            buftabs.setFavicon(label, tab);
        else
            buftabs.removeFavicon(label);

        // Set the correct highlight group
        if (tabs.index(null, true) == label.tabpos)
            label.setAttributeNS(NS.uri, "highlight", "BufTabSelected");
        else {
            if (tabs.index(tabs.alternate, true) == label.tabpos)
                label.setAttributeNS(NS.uri, "highlight", "BufTabAlternate");
            else
                label.setAttributeNS(NS.uri, "highlight", "BufTab");
        }

    },

    updateLabelTooltip: function (aLabel, aTab) {
        let label = buftabs.Olabel(aLabel);
        let tab = buftabs.Otab(aTab);
        let browser = tab.linkedBrowser;
        label.setAttribute('tooltiptext', tab.label + "\n" + browser.currentURI.spec);
    },

};

function registerMyListener() {
    gBrowser.tabContainer.addEventListener("TabOpen", buftabs.updateTabOpen, false);
    gBrowser.tabContainer.addEventListener("TabHide", buftabs.updateTabHide, false);
    gBrowser.tabContainer.addEventListener("TabMove", buftabs.updateTabMove, false);
    gBrowser.tabContainer.addEventListener("TabClose", buftabs.updateTabClose, false);
    gBrowser.tabContainer.addEventListener("TabSelect", buftabs.updateTabSelect, false);
    gBrowser.tabContainer.addEventListener("TabAttrModified", buftabs.updateTabAttrModified, false); // updateed, use fillLabel
}

function unregisterMyListener() {
    gBrowser.tabContainer.removeEventListener("TabOpen", buftabs.updateTabOpen, false);
    gBrowser.tabContainer.removeEventListener("TabHide", buftabs.updateTabHide, false);
    gBrowser.tabContainer.removeEventListener("TabMove", buftabs.updateTabMove, false);
    gBrowser.tabContainer.removeEventListener("TabClose", buftabs.updateTabClose, false);
    gBrowser.tabContainer.removeEventListener("TabSelect", buftabs.updateTabSelect, false);
    gBrowser.tabContainer.removeEventListener("TabAttrModified", buftabs.updateTabAttrModified, false);
}
window.addEventListener("load", buftabs.init, false);
window.addEventListener('unload', buftabs.destory, false);

// Options
options.add(["buftabs-progress", "btp"],
    "Show progress",
    "boolean",
    true,
    {
        setter: function (value) {
            buftabs.options = {'progress': value};
            return value;
        }
    }
);

options.add(["buftabs-rnu", "btr"],
    "Show Relative tabnumber",
    "boolean",
    false,
    {
        setter: function (value) {
            buftabs.options = {'rnu': value};
            return value;
        }
    }
);

options.add(["buftabs-elem", "bte"],
        "Show or hide certain elemments",
        "charlist",
        "nthb",
        {
            values: {
                'i': 'Favicon',
                'n': 'Tabnumber',
                't': 'Tab title',
                'h': 'History forward/backward indicate',
                'b': 'Bookmark state'
            },
            setter: function (value) {
                buftabs.options = {'elem': value};
                return value;
            }
        });

options.add(["buftabs-maxlength", "btm"],
        "Control the title length",
        "number",
        13,
        {
            setter : function (value) {
                buftabs.options = {'maxlength' : value};
                return value;
            }
        });

options.add(["buftabs-morestring", "bts"],
        "Indicated the overflow",
        "string",
        UTF8('...'),
        {
            setter : function (value) {
                buftabs.options = {'morestring' : value};
                return value;
            }
        });

options.add(["buftabs", "bt"],
        "Control whether to use buftabs in the statusline",
        "boolean",
        true,
        {
            setter: function (value) {
                buftabs.options = {'buftabs' : value};
                return value;
            }
        }
);

// Add custom commands
group.commands.add(["buf[tabs]", "bt"],
	"Activate buftabs manual",
	buftabs.setup,
	{
		argCount: 0
	}
);

// Initialise highlight groups
highlight.loadCSS(<![CDATA[
    !BufTabs                 color: inherit; margin:0 !important; padding:0 !important; overflow:hidden;
    !BufTab                  margin:0 !important; padding:0 !important;
    !BufTabAlternate         margin:0 !important; padding:0 !important;
    !BufTabSelected          margin:0 !important; padding:0 !important;
]]>);

