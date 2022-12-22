<script setup lang="ts">
import {ref, inject} from "vue";
import Editor from '@tinymce/tinymce-vue'
import type {BaseField} from "@/component";
import {useUploader} from "@/use/Uploader";
import {NScrollbar} from "naive-ui";

/* Import TinyMCE */
import tinymce from 'tinymce';

/* Default icons are required for TinyMCE 5.3 or above */
import 'tinymce/icons/default';

/* A theme is also required */
import 'tinymce/themes/silver';

/* Import the skin */
import 'tinymce/skins/ui/oxide/skin.css';

/* Import plugins */
import 'tinymce/plugins/advlist';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/autosave';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/codesample';
import 'tinymce/plugins/directionality';
import 'tinymce/plugins/emoticons';
import 'tinymce/plugins/emoticons/js/emojis';
import 'tinymce/plugins/fullscreen';
import 'tinymce/plugins/help';
import 'tinymce/plugins/image';
import 'tinymce/plugins/importcss';
import 'tinymce/plugins/insertdatetime';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/pagebreak';
import 'tinymce/plugins/preview';
import 'tinymce/plugins/quickbars';
import 'tinymce/plugins/save';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/plugins/template';
import 'tinymce/plugins/visualblocks';
import 'tinymce/plugins/visualchars';
import 'tinymce/plugins/wordcount';
import 'tinymce/models/dom';

/* Import premium plugins */
/* NOTE: Download separately and add these to /src/plugins */
/* import './plugins/checklist/plugin'; */
/* import './plugins/powerpaste/plugin'; */
/* import './plugins/powerpaste/js/wordimport'; */

/* Import content css */
import contentUiCss from 'tinymce/skins/ui/oxide/content.css';
import contentCss from 'tinymce/skins/content/default/content.css';

interface Field extends BaseField {
    uploader: {
        obs_config_url: string,
        uploaded_url: string,
        disk: string,
        dir: string,
    }
}

const review = ref(true)

tinymce.PluginManager.add('w_preview', (editor, url) => {
    // 注册一个工具栏按钮名称
    editor.ui.registry.addButton('w_preview', {
        icon: 'preview',
        onAction: () => {
            review.value = !review.value
        }
    });
})

const provides = inject<Field>('provides')!

const value = ref(provides.value || 'hello tiny mce')
const name = ref(provides.name)
const percentage = ref(0)

const init = {
    height: 484,
    branding: false,
    menubar: false,
    toolbar: [
        "undo redo bold italic underline strikethrough alignleft aligncenter alignright alignjustify outdent indent " +
        "fontsizeselect removeformat numlist bullist table emoticons charmap anchor link backcolor forecolor media code " +
        "codesample w_preview",
        // 'numlist bullist forecolor backcolor casechange permanentpen formatpainter charmap emoticons fullscreen media pageembed link anchor codesample a11ycheck showcomments addcomment w_preview',
    ],
    plugins: 'advlist anchor autolink autosave charmap code codesample directionality emoticons fullscreen help ' +
        'image importcss insertdatetime link lists media nonbreaking pagebreak preview quickbars save searchreplace table ' +
        'template visualblocks wordcount w_preview',
    // language: 'zh_CN',
    valid_elements: "p[style|class],a[style|class],abbr[style|class],b[style|class],blockquote[style|class],br[style|class],code[style|class],col[style|class|span|width],colgroup[style|class|span|width],dd[style|class],del[style|class],div[style|class],dl[style|class],dt[style|class],em[style|class],fieldset[style|class],h1[style|class],h2[style|class],h3[style|class],h4[style|class],h5[style|class],h6[style|class],hr[style|class],i[style|class],img[style|class|alt|src|height|width],ins[style|class],label[style|class],legend[style|class],li[style|class],ol[style|class|start|type],p[style|class],q[style|class],span[style|class],strong[style|class],sub[style|class],sup[style|class],table[style|class|width],tbody[style|class],td[style|class|colspan|height|rowspan|width],tfoot[style|class],th[style|class|colspan|height|rowspan|width],thead[style|class],tr[style|class],ul[style|class]",
    images_upload_handler: upload,
    content_css: '/vendor/dcat-admin-extensions/weiwait/dcat-vue/css/index.css',
    style_formats_merge: true,
    style_formats: [
        {
            title: '图片', items: [
                {
                    title: '适应', selector: 'img', styles: {
                        'max-width': '100%',
                        'height': 'auto',
                        'object-fit': 'contain',
                    }
                }
            ]
        }
    ],
}

function upload(file: any, success: Function, fail: Function) {
    useUploader.upload(provides.uploader, 'sgweg.png', file.blob(), percentage).then(({filename, url}: any) => {
        console.log(filename, url)

        success(url)
    }).catch((e: Error) => {
        console.log(e)
        fail(e.message)
    })
}

const header = `
<!DOCTYPE html>
<html lang="zh_CN">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=1080, initial-scale=0.4">
        <link rel="stylesheet" type="text/css" href="/vendor/dcat-admin-extensions/weiwait/dcat-vue/css/index.css">

        <title>预览</title>
        <style>
            * {
                padding: 0;
                margin: 0;
            }

            body {
                margin: 6px;
                zoom: 0.725;
                min-height: 651px;
            }
        </style>
    </head>
    <body>
`

const footer = `
</body>
</html>
`

</script>

<template>
    <div class="editor-container">
        <div class="editor-wrap">
            <editor
                api-key="p7lyj25wrufyee703b2pga63davo99oj9nrayugctp02goa2"
                v-model="value"
                :init="init"
            ></editor>
        </div>

        <div v-if="review" class="editor-review">
            <iframe :srcdoc="header + value + footer"></iframe>
        </div>
    </div>

<!--    <input v-if="provides.attributes.required" type="text" :required="!value.length" :disabled="!!value.length"-->
<!--           :name="`${name}_is_required`" style="display: none;">-->

    <input type="hidden" :name="name " :value="value">
    <input v-if="!value" type="hidden" :name="name" value="_def_">
</template>

<style>
@import "tinymce/skins/ui/oxide/skin.css";
@import 'tinymce/skins/ui/oxide/content.css';
@import 'tinymce/skins/content/default/content.css';
</style>

<style scoped lang="scss">

.editor-container {
    display: flex;
    flex-direction: row;
    gap: 8px 12px;

    .editor-wrap {
        flex-grow: 1;
    }

    .editor-review {
        width: 270px;
        height: 480px;
        border: 2px solid #eeeeee;
        border-radius: 12px;
        display: flex;
        position: relative;
        flex-shrink: 0;
        box-sizing: content-box;
        overflow-x: hidden;

        iframe {
            flex: 1;
            position: absolute;
            width: 285px;
            height: 100%;
            border: none;
        }
    }
}
</style>
