import { observable, action, computed, configure, runInAction } from 'mobx';
import { createContext, SyntheticEvent } from 'react';
import { IActivity } from '../models/activity';
import agent from '../api/agent';

configure({enforceActions: 'always'});

class ActivityStore {
    @observable activityRegistry = new Map();
    @observable activity: IActivity | null = null;
    @observable loadingInitial = false;
    @observable submitting = false;
    @observable target = '';

    getActivityFromActivityStore = (id: string) => {
        return this.activityRegistry.get(id);
    };

    groupActivitiesByDate(activities: IActivity[]) {
        const sortedActivities = activities.sort(
            (a, b) => Date.parse(a.date) - Date.parse(b.date)
        );

        return Object.entries(sortedActivities.reduce((activities, activity) => {
            const curActivityDate = activity.date.split('T')[0];
            activities[curActivityDate] = activities[curActivityDate] ? [...activities[curActivityDate], activity] : [activity];
            return activities;
        }, {} as {[key: string]: IActivity[]}));
    }

    @computed get activitiesByDate() {        
        return this.groupActivitiesByDate(Array.from(this.activityRegistry.values()));
    }

    @action loadActivities = async () => {
        this.loadingInitial = true;
        try {
            const activities = await agent.Activities.list();
            runInAction('loading activities', () => {
                activities.forEach(a => {
                    a.date = a.date.split('.')[0];
                    this.activityRegistry.set(a.id, a);
                });
    
                this.loadingInitial = false;
            });            
        } catch (err) {
            console.log(err);
            runInAction('load activities error', () => {
                this.loadingInitial = false;
            });            
        }
    };

    @action loadActivity = async (id: string) => {
        let actResult = this.getActivityFromActivityStore(id);
        if (actResult) {
            this.activity = actResult;
        } else {
            this.loadingInitial = true;
            try {
                actResult = await agent.Activities.details(id);
                runInAction('getting activity', () => {
                    this.activity = actResult;
                    this.loadingInitial = false;
                });
            } catch (err) {                
                runInAction('get activity error', () => {
                    this.loadingInitial = false;
                });
            }
        }
    };

    @action clearActivity = () => {
        this.activity = null;
    };

    @action createActivity = async (activity: IActivity) => {
        this.submitting = true;

        try {
            await agent.Activities.create(activity);
            runInAction('creating activities', () => {
                this.activityRegistry.set(activity.id, activity);
                this.submitting = false;
            });            
        } catch (err) {
            console.log(err);
            runInAction('create activities error', () => {
                this.submitting = false;
            });            
        }
    };

    @action editActivity = async (activity: IActivity) => {
        this.submitting = true;

        try {
            await agent.Activities.update(activity);
            runInAction('editing activity', () => {
                this.activityRegistry.set(activity.id, activity);
                this.activity = activity;
                this.submitting = false;
            });
        } catch (err) {
            console.log(err);
            runInAction('edit activity error', () => {
                this.submitting = false;
            });
        }
    };

    @action deleteActivity = async (event: SyntheticEvent<HTMLButtonElement>, id: string) => {
        this.submitting = true;
        this.target = event.currentTarget.name;

        try {
            await agent.Activities.delete(id);
            runInAction('deleting activity', () => {
                this.activityRegistry.delete(id);
                this.submitting = false;
                this.target = '';
            });            
        } catch (err) {
            console.log(err);
            runInAction('delete activity error', () => {
                this.submitting = false;
                this.target = '';
            });
        }
    };   
}

export default createContext(new ActivityStore());