class DojoQuery {

    constructor(element){
        if(element.startsWith("#")){
            this.element = document.getElementById(element.slice(1));
        }else{
            throw new Error("You must provide an id");
        }
    }

    click(callback){
        this.element.addEventListener("click", callback);
    }

    hover(cb1, cb2){
        this.element.addEventListener("mouseover", cb1);
        this.element.addEventListener("mouseout", cb2);
    }

    addClass(className){
        this.element.classList.add(className);
    }

    removeClass(className){
        this.element.classList.remove(className);
    }

}



function $dojo(element){
    return new DojoQuery(element);
}
