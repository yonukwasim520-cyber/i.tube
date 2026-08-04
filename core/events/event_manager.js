class EventManager {

    constructor(){
        this.events = {};
    }


    on(name, callback){

        if(!this.events[name]){
            this.events[name] = [];
        }

        this.events[name].push(callback);

    }


    emit(name, data){

        if(this.events[name]){

            for(const callback of this.events[name]){

                callback(data);

            }

        }

    }

}


module.exports = EventManager;
