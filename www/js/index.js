/* global pdf */
/* global $ */
/* global Backbone */
/* global cordova */

var $ = require('jquery');
var _ = require('underscore');
var Backbone = require('backbone');

var DEBUG = ((typeof cordova) === 'undefined');


function progressShow() {

    if (!_.isEmpty(window.cordova)) {
        SpinnerPlugin.activityStart("Generating PDF...", {
            dimBackground: true
        });
    }

};

function progressHide() {
    if (!_.isEmpty(window.cordova)) {
        SpinnerPlugin.activityStop();
    }
};

function success(msg) {

    if (!_.isEmpty(msg))
        $('#baseH').html('base64:' + msg.replace('\n', ''));

    debugger
    window.open('data:application/pdf,', escape(msg.replace('\n', '')))

    $.post("http://192.168.1.5:3000/b64", {
            pdf: msg
        })
        .done(function(data) {
            alert("Data Loaded: " + data);
        });

    progressHide();
};

function failure(err) {
    console.error('->', err);
    console.alert('An error has ocurred: ', err);

    progressHide();
};


var HomeView = Backbone.View.extend({

    initialize: function() {
        this.$button = this.$el.find('#generate');
        this.$url = this.$el.find('#url');
        this.$urlShare = this.$el.find('#url-share');
        this.$internalUrlShare = this.$el.find('#internal-url-share');

        this.$raw = this.$el.find('#rawhtml');
        this.$html = this.$el.find('#html');
        this.$display = this.$el.find('#display');

        this.success = success.bind(this);
        this.failure = failure.bind(this);
    },

    events: {
        'click #generate': 'makePDFBase64',
        'click #share': 'makePDFAndShare',
        'click #internal-share': 'internalPDFAndShare',
        'click #share-raw': 'makeRawPDFandShare',
    },

    makePDFBase64: function(e) {
        e.preventDefault()
        progressShow()

        debugger

        var orientation = $("#orientation option:selected").text();
        var documentSize = $("#document-size option:selected").val();

        var opts = {
            documentSize: documentSize,  
            landscape: orientation,
            type: "base64"
        }

        /* generate pdf using url. */
        pdf.fromURL(this.$url.val(), opts)
            .then(this.success)
            .catch(this.failure);
    },

    internalPDFAndShare: function(e) {
        e.preventDefault();

        progressShow();
        /* generate pdf using url. */

        if (cordova.platformId === 'ios') {
            console.log('Testing URL->', url)
            window.resolveLocalFileSystemURL(cordova.file.applicationDirectory,
                function(url) {
                    var file = this.$internalUrlShare.val().replace('file:///android_asset/', url.nativeURL);

                    pdf.htmlToPDF({
                        url: file,
                        documentSize: "A4",
                        landscape: "portrait",
                        type: "share"
                    }, this.success, this.failure);
                },
                function(err) {
                    console.log('error', err, '  args ->', arguments)
                }
            );
        } else {

            pdf.htmlToPDF({
                url: this.$internalUrlShare.val(),
                documentSize: "A4",
                landscape: "portrait",
                type: "share"
            }, this.success, this.failure);
        }
    },

    makePDFAndShare: function(e) {
        e.preventDefault();
        progressShow();
        /* generate pdf using url. */

        debugger

        var opts = {
            documentSize: "A4",
            landscape: "portrait",
            type: "share",
            fileName: $('#filename').val() || 'my-pdf.pdf'
        }


        pdf.fromURL(this.$urlShare.val(),
                opts)
            .then(this.success)
            .catch(this.failure);
    },

    makeRawPDFandShare: function(e) {
        e.preventDefault();

        //progressShow();
        /* generate pdf using url. */
        var opts = {
            documentSize: "A4",
            landscape: "portrait",
            type: "share"
        }

        var payload = $('#rawhtml').val()

        console.log('payload->', payload)

        pdf
            .fromData(payload, opts)
            .then(function(pdf) {}).catch(this.failure)
    }
});

var DemoRouter = Backbone.Router.extend({
    routes: {
        '*path': 'index',
    },

    index: function() {
        new HomeView({
            el: $('.starter-template')
        });
    }
});


if (DEBUG) {
    console.log('start app..');

    new DemoRouter();
    Backbone.history.start();
} else {
    document.addEventListener('deviceready', function() {

        console.log('start app..');



        new DemoRouter();
        Backbone.history.start();
    }, false);

}
