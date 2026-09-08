export enum GenderEnum {
    male,
    female
}

export enum ProviderEnum{
    system,
    google
}

export enum RoleEnum{
    user,
    admin
}

export interface IUser {
    username:string
    email:string
    password:string
    age:number
    phone:string
    gender:GenderEnum
    provider:ProviderEnum
    role: RoleEnum
    profilePicture:string
    coverPicture:string
    bio:string
    posts:string[]
    comments:string[]
    friends:string
    isOnline:boolean
    isActive:boolean
    confirmedAt:Date
    changedCredentialsAt:Date
}