/**
 * Created with JetBrains PhpStorm.
 * User: lispad
 * Date: 13.04.13
 * Time: 17:47
 * To change this template use File | Settings | File Templates.
 */

$(document).ready(function(){
    new LApp().init();
});

LApp=function(){
    this.init=function(){
        this.history.init();
        this.log = new LChat($('.page.chat > textarea'));
        $('.navbar-inner > ul.nav > li > ._connect').click(function(){
            if (typeof this.CS=='undefined'  || !this.CS.isConnected())
                this.connect();
            else
                this.disconnect();
        }.bind(this));
    };

    this.connect=function (){
        var buf='';
        /* Connection is set on creating, we have to recreate websocket to reconnect */
        this.CS=new LWebSocket("localhost", 8080);
        this.CS.on('connect',function(){
            this.log.add("==Connected to WebSocket==\n");
            $('.navbar-inner > div > ._status').removeClass('badge-important').removeClass('badge-info').addClass('badge-success').text('connected');
        }.bind(this));

        this.CS.on('disconnect',function(){
            this.log.add("==Socket closed (not connected):==\n");
            $('.navbar-inner > div > ._status').removeClass('badge-success').removeClass('badge-info').addClass('badge-important').text('disconnected');
        }.bind(this));

        this.CS.on('receive', function(data){
            this.log.push(data);
//        buf+=data;
//        var received=buf.split("\n");
//        buf=received.pop()
//        received.forEach(function(value){
//            log.add(value);
//        })
        }.bind(this));

        this.log.onChar(function(key){
            this.CS.send(key);
        }.bind(this));

        $('.navbar-inner > div > ._status').removeClass('badge-important').removeClass('badge-success').addClass('badge-info').text('connecting');
        this.CS.connect();
    };

    this.disconnect=function(){
        this.CS.disconnect();
    };


    this.history = {
        init: function () {
            window.addEventListener('popstate', function (event) {
                var url = location.hash.replace("#", '') || location.pathname.replace("/", '');
                if (url)
                    this._goToPage(url);
            }.bind(this), false);
        },
        _goToPage: function (url) {
            $('.navbar-inner > ul.nav > li').removeClass('active');
            $('.navbar-inner > ul.nav').children('.' + url).addClass('active');
            $('.page').hide();
            $('.page.' + url).show();
        }
    };
};

LWebSocket=function (addr, port){
    this._addr=addr;
    this._port = port;
    this._ws = null;
    this._listeners={
        connect:[],
        disconnect:[],
        receive:[]
    };

    this.isConnected=function() {
        return this._ws.readyState==this._ws.OPEN;
    };

    this.setPort = function (port){
        this._port=port;
    };

    this.send = function (buffer){
        if (this.isConnected())
            this._ws.send(buffer);
    };

    this.on = function (type, callback){
        if (typeof this._listeners[type]!='undefined')
            this._listeners[type].push(callback);
    };

    this.connect = function(){
        this._ws = new WebSocket('ws://'+this._addr+':'+this._port);

        this._ws.onopen = function() {
            this._listeners.connect.forEach(function(callback){callback();});
        }.bind(this);

        this._ws.onmessage = function (evt) {
            this._listeners.receive.forEach(function(callback){callback(evt.data);});
        }.bind(this);

        this._ws.onclose = function(ev) {
            this._listeners.disconnect.forEach(function(callback){callback();});
        }.bind(this);
    };

    this.disconnect=function(){
        this._ws.close();
    };
};

LChat=function(area){
    this._area=null;
    this._callback=null;
    this._echo=false;

    this.setArea=function(area){
        if (area instanceof $)
            this._area=area.get(0);
        else
            this._area=area||null;

        $(this._area).on('keypress',function(event){
            var key=String.fromCharCode(parseInt(event.charCode));
            if (this._callback!=null)
                this._callback(key);
            return this._echo;
        }.bind(this));
    };
    this.add=function(text){
        if (this._area.value.length>1024)
            this._area.value=this._area.value.substr(0, 1024);
        this._area.value=text+this._area.value;
    };

    this.push=function(text){
        this._area.value+=text;
    };

    this.clear=function(){
        this._area.value='';
    };

    this.onChar=function (callback){
        this._callback=callback;
    };

    this.echo=function (enabled){
        this._echo=enabled;
    };

    this.setArea(area);
};
