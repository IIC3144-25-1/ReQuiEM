import { ISurgery } from '@/models/Surgery';
import { ITeacher } from '@/models/Teacher';
import { IUser } from '@/models/User';

export function isISurgery(surgery: object | ISurgery): surgery is ISurgery {
    return typeof surgery === 'object' && surgery !== null && 'name' in surgery;
}

export function isITeacher(teacher: object | ITeacher): teacher is ITeacher {
    return typeof teacher === 'object' && teacher !== null && 'user' in teacher;
}

export function isIUser(user: object | IUser): user is IUser {
    return typeof user === 'object' && user !== null && 'name' in user;
}

export function isIResident(resident: object | ITeacher): resident is ITeacher {
    return typeof resident === 'object' && resident !== null && 'user' in resident;
}

