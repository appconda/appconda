

export class WOC {

    private currentSection: any;
    private loadingMax: number = 0;
    private loadingCount: number = 0;
    private stepInCode: any;
    private ext_debugging: any;
    private watchCode: boolean = false;
    private sections: any[] = [];
    private finalWait: any;
    waitThis: any;
    waiting: any;
    isErrorProc: any;
    waitInstructions: any;
    break: boolean = false;
    displayEndAlert: boolean = false;
    aoz: any;
    startTime: number = 0;
    timestep: number = 0;
    waitForFinalLoad: any;
    checkDebuggerRestart: any;
    section: any;
    root: any;
    synchroList: any[] = [];
    deltaTime: any;
    tasks: any[] = [];


    private initSection(section, ret?) {
        if (ret) {
            section.currentResult = ret.result;
        }
        if (!section.self)
            section.self = section;
        section.results = [];
        section.returns = [];
        section.onError = false;
        section.isErrorProc = false;
        section.lastError = 0;
        section.lastErrorMessage = '';
        section.position = 0;
        section.initialized = true;
        section.nextError = null;
        section.trappedErrorNumber = 0;
        section.objects = {};

        // Find a sub-object
        section.getObject = function (index) {
            var thisArray = this.parent[this.className];
            if (!thisArray)
                thisArray = this.parent[this.objectName];
            if (!thisArray)
                throw 'object_not_found';
            if (!thisArray[index])
                throw 'object_not_found';
            return thisArray[index];
        };
        return section;
    }

    public runBlocks(section, allowWaiting) {
        var ret;
        var quit = false;

        if (!section.initialized)
            section = this.initSection(section);

        if (typeof section.startBlock != 'undefined') {
            section.position = section.startBlock;
            section.startBlock = undefined;
        }

        do {
            this.currentSection = section;
            if (this.loadingMax > 0) {
                if (this.loadingCount < this.loadingMax) {
                    if (this.stepInCode)
                        this.ext_debugging.update(true);
                    break;
                }
                this.loadingCount = 0;
                this.loadingMax = 0;
            }

            if (section.waiting) {
                if (!section.waiting.call(section.waitThis, section)) {
                    if (this.stepInCode)
                        this.ext_debugging.update(true);
                    break;
                }
                section.waiting = null;
            }

            if (this.watchCode && !section.isDebuggerCommand)
                this.ext_debugging.doWatch();
            if (this.stepInCode && !section.isDebuggerCommand) {
                if (!this.ext_debugging.stepIn(section))
                    break;
            }
            section.hasRan = true;

            do {
                //console.log( "Block " + section.position + " - Sourcepos: " + this.sourcePos );
                ret = section.blocks[section.position++].call(section.self, this, section.vars);
            } while (!ret && !this.stepInCode);

            if (ret) {
                switch (ret.type) {
                    // End
                    case 0:
                        section = this.popSection(section);
                        break;

                    // Goto
                    case 1:
                        section.position = ret.label;
                        break;

                    // Gosub
                    case 2:
                        section.returns.push(ret.return);
                        section.position = ret.label;
                        break;

                    // Return
                    case 3:
                        if (section.returns.length == 0)
                            throw 'return_without_gosub';
                        section.position = section.returns.pop();

                        // End of Every gosub?
                        if (section.position < 0) {
                            section.position = -section.position - 1;
                            quit = true;
                        }
                        break;

                    // Procedure call
                    case 4:
                        this.sections.push(section);
                        var newSection = new section.root['p_' + ret.procedure](this, section, ret.args);
                        section = this.initSection(newSection, ret);
                        break;

                    // Resume
                    case 5:
                        if (!section.isErrorOn && !section.isErrorProc) {
                            throw 'resume_without_error';
                        }
                        else {
                            if (this.isErrorProc)
                                section = this.popSection(section);
                            if (!ret.label)
                                section.position = section.resume - 1;
                            else
                                section.position = ret.label;
                            section.isErrorOn = false;
                        }
                        break;

                    // Resume next
                    case 6:
                        if (!section.isErrorOn && !section.isErrorProc) {
                            throw 'resume_without_error';
                        }
                        else {
                            if (section.isErrorProc)
                                section = this.popSection(section);
                            section.position = section.resume;
                            section.isErrorProc = false;
                            section.isErrorOn = false;
                            quit = true;
                        }
                        break;

                    // Resume label
                    case 7:
                        if (!section.isErrorOn && !section.isErrorProc) {
                            throw 'resume_without_error';
                        }
                        else {
                            if (section.isErrorProc)
                                section = this.popSection(section);
                            section.position = section.resumeLabel;
                            section.isErrorOn = false;
                        }
                        break;

                    // Blocking instruction
                    case 8:
                        if (allowWaiting)
                            section.waiting = this.waitInstructions[ret.instruction + '_wait'];
                        else
                            throw 'cannot_wait_in_event_procedures';
                        //section.waiting = this.waitInstructions[ 'noWait_wait' ];
                        section.waitThis = this;
                        this.waitInstructions[ret.instruction].call(this, ret.args, section);
                        break;

                    // Blocking function
                    case 9:
                        if (allowWaiting)
                            section.waiting = this.waitInstructions[ret.instruction + '_wait'];
                        else
                            throw 'cannot_wait_in_event_procedures';
                        //section.waiting = this.waitInstructions[ 'noWait_wait' ];
                        section.waitThis = this;
                        this.waitInstructions[ret.instruction].call(this, ret.result, ret.args, section);
                        break;

                    // Instruction Object
                    case 10:
                        if (typeof ret.instance == 'undefined') {
                            this.sections.push(section);
                            var newSection = new section.root['i_' + ret.instruction](this, section, ret.args);
                            section = this.initSection(newSection, ret);
                        }
                        else {
                            var newSection: any = undefined;
                            var parent = section;
                            while (parent && !newSection) {
                                newSection = parent.objects[ret.instance];
                                parent = parent.parent;
                            }
                            if (!newSection) {
                                section = this.constructObject(section, ret.instruction, ret.instance, ret);
                            }
                            else {
                                this.updateObject(newSection, ret.args);
                                /*
                                for ( var p in ret.args )
                                {
                                    var name = p.toLowerCase();
                                    var value = 'value';
                                    if ( p.endsWith( '_f' ) )
                                    {
                                        name = name.substring( 0, name.length - 2 );
                                        value += '_f';
                                    }
                                    else if ( p.endsWith( '$' ) )
                                    {
                                        name = name.substring( 0, name.length - 1 );
                                        value += '$';
                                    }
                                    if ( newSection[ 'm_set' + name ] )
                                    {
                                        this.sections.push( section );
                                        var setterSection = new newSection[ 'm_set' + name ]( this, newSection, ret.args );
                                        setterSection.vars = {};
                                        setterSection.vars[ value ] = ret.args[ p ];
                                        section = this.initSection( setterSection );				
                                    }
                                    else
                                    {
                                        if ( !newSection.varModified )
                                            newSection.varsModified = {};
                                        newSection.varsModified[ p ] = ret.args[ p ];
                                    }
                                    newSection.modified = true;
                                }
                                */
                            }
                        }
                        break;

                    // Function
                    case 11:
                        this.sections.push(section);
                        var newSection = new section.root['f_' + ret.instruction](this, section, ret.args);
                        section = this.initSection(newSection, ret);
                        break;

                    // Blocking instruction from language definition
                    case 12:
                        if (allowWaiting) {
                            section.waitThis = ret.waitThis;
                            section.waiting = ret.waitThis[ret.waitFunction];
                        }
                        else {
                            throw 'cannot_wait_in_event_procedures';
                            //section.waiting = this.waitInstructions[ 'noWait_wait' ];
                            //section.waitThis = this;
                        }
                        ret.waitThis[ret.callFunction].call(ret.waitThis, ret.args, section);
                        break;

                    // Pop
                    case 13:
                        if (section.returns.length == 0)
                            throw 'return_without_gosub';
                        section.returns.pop();
                        break;

                    // Edit
                    case 14:
                        this.break = true;
                        this.displayEndAlert = false;
                        break;

                    // Creation of an object
                    case 15:
                        if (typeof ret.instance == 'undefined') {
                            debugger;
                        }
                        else {
                            if (!section.objects[ret.instance]) {
                                section = this.constructObject(section, ret.object, ret.instance, ret);
                            }
                            else {
                                section.results[ret.result] = section.objects[ret.instance];
                            }
                        }
                        break;

                    // End / Break inside of procedures
                    case 16:
                        if (section.isDebuggerOutput) {
                            this.aoz.ext_debugging.winConsole.log({ text: this.aoz.toPrintToDebugger, sameLine: false });
                            this.aoz.toPrintToDebugger = '';
                        }
                        this.popSection(section);
                        section = null;
                        break;

                    // Call of a object derivative method
                    case 17:
                        section.nextError = false;
                        if (typeof ret.instance == 'string') {
                            if (ret.instance == 'super') {
                                ret.instance = section.parent.childOf;
                                ret.method += '_default';
                            }
                            else {
                                var parent = section;
                                while (parent && !parent.objects[ret.instance])
                                    parent = parent.parent;
                                ret.instance = parent.objects[ret.instance];
                            }
                        }
                        if (!ret.instance)
                            throw { error: 'object_not_found', parameter: ret.instance };
                        var method = ret.instance[ret.method + '_m'];
                        if (!method)
                            throw { error: 'method_not_found', parameter: ret.method };

                        this.sections.push(section);
                        //var newSection = new method( this, newSection, ret.args );
                        section = method;
                        section.currentResult = ret.result;
                        section.vars = ret.args;
                        section = this.initSection(section);
                        break;

                    // Call of a method from "this"
                    case 18:
                        break;

                    // End the program in direct mode.
                    case 19:
                        section.waiting = function () { return false; };
                        section.waitThis = this;
                        break;

                    // Quit the loop
                    case 20:
                        quit = true;
                        break;

                    default:
                        break;
                }
            }
            ret = null;
            if (allowWaiting && (performance.now() - this.startTime >= this.timestep))
                break;
        } while (section && !quit && !this.break)
        return section;
    }

    private updateObject(aozObject, varsModified, fromFriend?) {
        var method = aozObject['m_update'];
        if (method) {
            if (aozObject.hasRan) {
                if (aozObject['update_m'].inLine) {
                    aozObject.deltaTime = this.deltaTime;
                    aozObject.varsModified = varsModified;
                    aozObject.friend = aozObject;
                    aozObject.fromFriend = fromFriend;
                    aozObject['update_m'].blocks[0].call(aozObject, this, {});
                    aozObject.fromFriend = null;
                }
                else {
                    var newSection = new method(this, aozObject, {});
                    newSection = this.initSection(newSection);
                    newSection.vars = { DeltaTime: this.deltaTime };
                    newSection.currentResult = 0;
                    aozObject.varsModified = varsModified;
                    aozObject.fromFriend = fromFriend;
                    newSection.callAtPop = function (cSection, pop) {
                        aozObject.fromFriend = null;
                    };
                    this.addTask(newSection);
                }
            }
        }
    }
    private addTask(section) {
        var task =
        {
            section: section,
            sections: [null],
            paused: false
        };
        this.tasks.push(task);
        return task;
    }

    private constructObject(section, className, instance, ret) {
        var sectionsDone = {};
        var self = this;
        function constructSection(previousSection, name, ret, count?) {
            count = typeof count == 'undefined' ? 0 : count;

            self.sections.push(previousSection);
            var newSection = new self.root['c_' + name](self, previousSection, ret.args);
            newSection.self = newSection;
            if (count > 0) {
                previousSection.childOf = newSection;
                newSection.self = previousSection.self;
            }
            if (!newSection.noDefaults) {
                for (var p in newSection.defaults) {
                    if (typeof ret.args[p] == 'undefined')
                        ret.args[p] = newSection.defaults[p];
                }
            }
            newSection.vars = ret.args;
            newSection.name = ret.instance;
            self.initSection(newSection, ret);		// Will execute block[ 0 ]-> constructor.
            sectionsDone[name] = newSection;
            count++;

            for (var e = 0; e < newSection.extendsList.length; e++) {
                name = newSection.extendsList[e].toLowerCase();
                if (!sectionsDone[name])
                    newSection = constructSection(newSection, name, ret, count);
            }
            return newSection;
        }
        function linkSections(currentSection) {
            var parentSection = currentSection.childOf;
            if (parentSection) {
                // Copy from parent to child
                for (var p in parentSection) {
                    if (p.indexOf('m_') == 0) {
                        if (!currentSection[p]) {
                            currentSection[p] = parentSection[p];
                        }
                    }
                }

                // Virtual functions-> from child to parent
                for (var p in currentSection) {
                    if (p.indexOf('m_') == 0) {
                        if (parentSection[p]) {
                            parentSection[p] = currentSection[p];
                        }
                    }
                }
                linkSections(parentSection);
            }
        };
        var previousSection = section;
        section = constructSection(previousSection, className, ret);
        previousSection.objects[instance] = sectionsDone[className];
        previousSection.root.objects[instance] = sectionsDone[className];
        if (typeof ret.result != 'undefined')
            previousSection.results[ret.result] = sectionsDone[className];
        linkSections(sectionsDone[className]);
        this.addToSynchro(sectionsDone[className]);
        return section;
    }

    private addToSynchro(thisObject, rootObject?) {
        if (thisObject['update_m']) {
            if (typeof rootObject == 'undefined')
                rootObject = thisObject;
            var found = this.synchroList.findIndex(function (element) {
                return (element.thisObject == thisObject && element.thisObject.objectNumber == thisObject.objectNumber);
            });
            if (found < 0)
                this.synchroList.splice(0, 0, { thisObject: thisObject, rootObject: rootObject, updateNext: 1 });
            else
                this.synchroList[found].rootObject = rootObject;
        }
    };


    private popSection(currentSection) {
        var pop = this.sections.pop();

        // Get the result of the current section?
        if (currentSection.callAtPop) {
            currentSection.callAtPop(currentSection, pop);
            currentSection.callAtPop = null;
        }

        // Do the pop!
        if (pop) {
            if (this.finalWait) {
                this.finalWait--;
                if (this.finalWait == 0) {
                    this.waitThis = this;
                    this.waiting = this.waitForFinalLoad;
                }
            }
            if (this.checkDebuggerRestart) {
                if (this.ext_debugging && this.ext_debugging.breakInCode && pop.contextName == 'application') {
                    try {
                        var file = localStorage.getItem('_debugger_restart_');
                        if (file) {
                            localStorage.removeItem('_debugger_restart_');
                            this.ext_debugging.breakInCode({});
                        }
                    }
                    catch (e) {
                    }
                    this.checkDebuggerRestart = false;
                }
            }
        }
        this.section = pop;
        return pop;
    }

}