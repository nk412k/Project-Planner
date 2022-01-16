class Tooltip {
    constructor(closeNotifierFunc){
        this.closeNotifier=closeNotifierFunc;
    }
    clooseTooltip = () => {
        this.detach();
        this.closeNotifier();
    }
    detach(){
        this.element.remove();
    }
    attach(info,id){
        const newElement=document.createElement('div')
        const parent=document.getElementById(id)
        const parentTop=parent.offsetTop;
        const parentLeft=parent.offsetLeft;
        const parentHeight=parent.clientHeight;
        const parentScrollHeight=parent.scrollTop;

        const x=parentLeft + 20;
        const y=parentTop+parentHeight-parentScrollHeight-10;
        newElement.className='card';
        const tooltiptemplate=document.getElementById('temp');
        const tooltipbody=document.importNode(tooltiptemplate.content,true);
        tooltipbody.querySelector('p').textContent=info;
        newElement.append(tooltipbody);
        newElement.style.position='absolute';
        newElement.style.left=x + 'px';
        newElement.style.top= y +'px';
        newElement.addEventListener('click',this.clooseTooltip)
        this.element=newElement;
        parent.append(newElement);
    }
}

class ProjectItem {
    hasActiveTooltip=false;
    constructor(id,updateProjectListsfunction,type){
        this.id=id;
        this.updateProjectListsHandler=updateProjectListsfunction;
        this.connectSwithButton(type);
        this.connectMoreInfo();
        this.connectDrag();
    }

    showMoreInfoHandler(){
        if(this.hasActiveTooltip){
            return;
        }
        const productItem=document.getElementById(this.id);
        const moreInfo=productItem.dataset.extraInfo;
        
        const tooltip=new Tooltip(() =>{
            this.hasActiveTooltip=false;
        });
        tooltip.attach(moreInfo,this.id);
        this.hasActiveTooltip=true;
    }

    connectDrag(){
        document.getElementById(this.id).addEventListener('dragstart',(event) =>{
            event.dataTransfer.setData('text/plain',this.id);
            event.dataTransfer.effectAllowed='move';
        })
    }

    connectMoreInfo(){
        const projectItemElemnet=document.getElementById(this.id);
        const moreinfoBtn=projectItemElemnet.querySelector('button:first-of-type');
        moreinfoBtn.addEventListener('click',this.showMoreInfoHandler.bind(this));
    }

    connectSwithButton(type){
        const projectItemElemnet=document.getElementById(this.id);
        const switchBtn=projectItemElemnet.querySelector('button:last-of-type');
        switchBtn.textContent= type==='active'?'Finish':'Activate';
        switchBtn.addEventListener('click',this.updateProjectListsHandler.bind(null,this.id));
        switchBtn.removeEventListener('click',this.updateProjectListsHandler.bind(null,this.id));
    }

    update(updateProjectListfunc,type){
        this.updateProjectListsHandler=updateProjectListfunc;
        this.connectSwithButton(type);
    }
    
}

class ProjectLists{
    projects=[];
    constructor(type){
        this.type=type;
        const prjItems=document.querySelectorAll(`#${type}-projects li`);
        for(const prjItem of prjItems){
            this.projects.push(new ProjectItem(prjItem.id,this.switchProject.bind(this),this.type));
        }
        console.log(this.projects);
        this.connectDraggable();
    }
    setSwitchHandlerFunction(switchHandlerFunction){
        this.switchHandler=switchHandlerFunction;
    }

    connectDraggable(){
        const list=document.querySelector(`#${this.type}-projects ul`);
        list.addEventListener('dragenter',(event) =>{
            if(event.dataTransfer.types[0]=='text/plain'){
                list.parentElement.classList.add('draggable');
                event.preventDefault();
            }
        });
        list.addEventListener('dragover',(event) =>{
            if(event.dataTransfer.types[0]=='text/plain'){
                event.preventDefault();
            }
        });
        list.addEventListener('dragleave', event=>{
            if(event.relatedTarget.closest(`#${this.type}-projects ul`) !==list){
                list.parentElement.classList.remove('draggable');
            }
        });
       
        list.addEventListener('drop',(event)=>{
            const prjid=event.dataTransfer.getData('text/plain');
            if(prjid===this.projects.find(p => p.id===prjid)){
                return;
            }
            document.getElementById(prjid).querySelector('button:last-of-type').click();
            list.parentElement.classList.remove('draggable');
            event.preventDefault();
        });

        
    }
    addProject(project){
        this.projects.push(project);
        DOMHelper.moveElement(project.id,`#${this.type}-projects ul`);
        project.update(this.switchProject.bind(this),this.type)  

    }
    switchProject(projectId){
        this.switchHandler(this.projects.find(p => p.id === projectId));
        this.projects=this.projects.filter(p => p!== projectId);
    }
}

class DOMHelper{
    static moveElement(projectId,newDestination){
        const element=document.getElementById(projectId);
        const destination=document.querySelector(newDestination);
        destination.append(element);
        element.scrollIntoView({'behavior':'smooth'});
    }
}

class App {
    static init(){
        const activeProjectList=new ProjectLists('active');
        const finishedProjectList=new ProjectLists('finished');
        activeProjectList.setSwitchHandlerFunction(finishedProjectList.addProject.bind(finishedProjectList));
        finishedProjectList.setSwitchHandlerFunction(activeProjectList.addProject.bind(activeProjectList));
    }
}

App.init();