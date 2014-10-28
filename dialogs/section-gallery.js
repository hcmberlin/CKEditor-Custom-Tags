/**
 * @fileOverview Definition for "customtags" / "section-gallery" plugin dialog.
 */

'use strict';

var _customTagName = 'section-gallery';

CKEDITOR.dialog.add(_customTagName, function(editor) {
	var _plugin = CKEDITOR.plugins.get('customtags');
	
	var lang = editor.lang.customtags[_customTagName];

	return {
		title: lang.dialogueTitle,
		minWidth: 220,
		minHeight: 80,
		contents: [{
			elements: [{
				id: 'id',
				type: 'text',
				style: 'width: 100%;',
				label: lang.attributeId,
				'default': '',
				required: true,
				validate: CKEDITOR.dialog.validate.regex(/^[0-9]+$/, lang.attributeIdInvalid),
				setup: _plugin._dialogueLoadValue,
				commit: _plugin._dialogueCommitValue
			}/*, {
				id: 'entry-img-id',
				type: 'text',
				style: 'width: 100%;',
				label: lang.attributeEntryImgId,
				'default': '',
				required: false,
				// validate: CKEDITOR.dialog.validate.regex(/^[0-9]+$/, lang.attributeEntryIdInvalid),
				setup: _plugin._dialogueLoadValue,
				commit: _plugin._dialogueCommitValue
			}*/]
		}],
		onShow: function() {
			_plugin._dialogueOnShow(this, _customTagName);
		},
		onOk: function() {
			_plugin._dialogoueOnOk(this, editor, _customTagName);
		}
	};

});