/**
 * @fileOverview The "customtags" plugin.
 */

'use strict';

(function() {
	
	CKEDITOR.plugins.add('customtags', {
		requires: 'dialog,fakeobjects',
		lang: 'de,en',
		//icons: 'customtags',
		//hidpi: true,
		
		_tags: {
			'section-img': {
				attributes: ['id'],
				dtd: ['$block', '$empty'],
				css: 'background-image: url(' + CKEDITOR.getUrl(CKEDITOR.plugins.getPath('customtags')) + 'icons/section-img-editor.png); background-repeat: no-repeat; background-position: center center; width: 38px; height: 32px;'
			},
			'section-gallery': {
				attributes: ['id'],
				dtd: ['$block', '$empty'],
				css: 'background-image: url(' + CKEDITOR.getUrl(CKEDITOR.plugins.getPath('customtags')) + 'icons/section-gallery-editor.png); background-repeat: no-repeat; background-position: center center; width: 38px; height: 32px;'
			}
		},
		
		onLoad: function() {
			for (var tag in this._tags) {
				CKEDITOR.addCss('.cke_' + tag + '{' +  this._tags[tag].css + '}');
			}
		},
	
		init: function(editor) {
			var contextMenuItems = {};
			
			for (var tag in this._tags) {
				var lang = editor.lang[this.name][tag];
				
				// Add Tag to DTD's
				CKEDITOR.dtd[tag] = {};
				for (var i in this._tags[tag].dtd) {
					CKEDITOR.dtd[this._tags[tag].dtd[i]][tag] = 1;
				}
				
				// Allow Tag + Attributes
				var allow = tag;
				if (this._tags[tag].attributes) {
					allow += '[';
					for (var i in this._tags[tag].attributes) {
						if (i > 0) allow += ',';
						allow += this._tags[tag].attributes[i];
					}
					allow += ']';
				}
				editor.filter.allow(allow);
				
				// Add Hover-Title
				editor.lang.fakeobjects[tag] = lang.elementHoverTitle;
				
				// Add Command
				editor.addCommand(tag, new CKEDITOR.dialogCommand(tag));
				
				// Add Dialog
				CKEDITOR.dialog.add(tag, this.path + 'dialogs/' + tag + '.js');
				
				// Add Doubleclick-Handler
				editor.on('doubleclick', function(e) {
					var tag = e.data.element.data('cke-real-element-type');
					if (CKEDITOR.plugins.get('customtags')._tags[tag]) e.data.dialog = tag;
				}, null, null, 0);
				
				// Add Toolbar-Button
				editor.ui.addButton && editor.ui.addButton(tag, {
					label: (lang && lang.buttonTitle) ? lang.buttonTitle : tag,
					command: tag,
					icon: this.path + 'icons/' + tag + '-menu.png'
				});
				
				// Register Context-Menu-Entry
				if (editor.contextMenu) {

					contextMenuItems[tag] = {
						label: lang.contextMenuTitle,
						icon: this.path + 'icons/' + tag + '-menu.png',
						command: tag,
						group: tag
					};
					
					editor.addMenuGroup(tag);
				}
			}
			
			editor.addMenuItems(contextMenuItems);		
			
			editor.contextMenu.addListener(function(element, selection) {
				var tag = element.data('cke-real-element-type');

				if (!element || !element.is('img') || element.isReadOnly() || !CKEDITOR.plugins.get('customtags')._tags[tag]) return;
				
				var ret = {};
				ret[element.data('cke-real-element-type')] = CKEDITOR.TRISTATE_OFF;
				return ret;
			});
		},

		afterInit: function(editor) {
			var rules = {elements: {}};

			for (var tag in this._tags) {
				rules.elements[tag] = function(element) {
					return editor.createFakeParserElement(element, 'cke_' + element.name, element.name, true);
				};
			}
			
			editor.dataProcessor.dataFilter.addRules(rules);
		},
		
		_dialogueLoadValue: function(attributes) {
			if (this.id in attributes) this.setValue(attributes[this.id]);
		},
		
		_dialogueCommitValue: function(attributes) {
			attributes[this.id] = this.getValue();
		},
		
		_dialogueOnShow: function(dialogue, tag) {
			dialogue.elFake = dialogue.iframeNode = null;

			var elFake = dialogue.getSelectedElement();
			
			if (!elFake || !elFake.data('cke-real-element-type') || elFake.data('cke-real-element-type') !== tag) return;		

			dialogue.elFake = elFake;

			var html = decodeURIComponent(elFake.data('cke-realelement')),
				attributes = [],
				i, i1, i2, i3, attribute, attributeValue, useChar;
			
			i = html.indexOf(" ");
			html = html.substr(i);

			while (html.indexOf("=") >= 0) {
				i = html.indexOf("=");
				attribute = html.substr(0, i).replace(/^\s+|\s+$/g,"");
				html = html.substr(i+1);
				
				i = -1;
				i1 =  html.indexOf("'");
				i2 =  html.indexOf('"');
				i3 =  html.indexOf('>');

				if (i1 >= 0) i = i1;
				if (i2 >=0 && (i2 < i || i < 0) ) i = i2;
				if (i3 >=0 && (i3 < i || i < 0) ) html = "";
				
				useChar = html.substr(i, 1);
				html = html.substr(i + 1);

				if (html.indexOf(useChar) >= 0) {
					i = html.indexOf(useChar);
					attributeValue = html.substr(0, i).replace(/^\s+|\s+$/g,"");
					html = html.substr(i+1);
					attributes[attribute] = attributeValue;
				} else html = "";
			}
			
			dialogue.setupContent(attributes);
		},
		
		_dialogoueOnOk: function(dialogue, editor, tag) {
			var attributes = [],
				elFake = new CKEDITOR.dom.element(tag);
			
			dialogue.commitContent(attributes);

			for (var i in attributes) {
				attributes[i] = attributes[i].replace(/^\s+|\s+$/g,"");
				if (attributes[i] != "") elFake.setAttribute(i, attributes[i]);
			}

			var elFakeNew = editor.createFakeElement(elFake, 'cke_' + tag, tag, true);

			if (dialogue.elFake) {
				elFakeNew.replace(dialogue.elFake);
			} else {
				editor.insertElement(elFakeNew);
			}
			
			editor.getSelection().selectElement(elFakeNew);
		}
	});

})();
