function Item(opts) {
    this.__name__ = arguments.callee.name
    this._attributes = (opts && opts.attributes) ||  {}
    this._collections = []
    this._event_listeners = {}
    this._subcollections = []
    this._persistAttributes
}

jstorrent.Item = Item

Item.prototype = {
    getCollection: function() {
        console.assert(this._collections.length == 1)
        return this._collections[0]
    },
    registerPersistAttributes: function(arr) {
        this._persistAttributes = arr
    },
    registerSubcollection: function(key) {
        // when this item gets saved, not only save its attributes,
        // but save a special key, which points to a collection.
        this._subcollections.push(key)
    },
    trigger: function(k,newval,oldval) {
        //console.log('item trigger',k,newval,oldval)
        if (this._event_listeners[k]) {
            if (k == 'change') {
                if (newval === oldval) {

                } else {
                    for (var i=0; i<this._event_listeners[k].length; i++) {
                        this._event_listeners[k][i](this, newval, oldval)
                    }
                }
            } else {
                for (var i=0; i<this._event_listeners[k].length; i++) {
                    this._event_listeners[k][i].apply(this, arguments)
                }
            }
        }
        if (this._collections.length > 0) {
            for (var i=0; i<this._collections.length; i++) {
                this._collections[i].trigger(k, this, newval, oldval)
            }
        }
    },
    save: function() {
        for (var i=0; i<this._collections.length; i++) {
            this._collections[i].save()
        }
    },
    on: function(event_name, callback) {
        if (! this._event_listeners[event_name]) {
            this._event_listeners[event_name] = []
        }
        this._event_listeners[event_name].push(callback)
    },
    set: function(k,v) {
        var oldval = this._attributes[k]
        this._attributes[k] = v
        this.trigger('change',k,v,oldval)
    },
    get: function(k) {
        return this._attributes[k]
    }
}