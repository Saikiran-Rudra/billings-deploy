import { Expense } from "../models/Expenses.js";

export const createExpense = async(data:any)=>{
    return await Expense.create({
        companyId: data.companyId,
        ...data
    });
};

export const getExpenses =async(companyId:string)=>{
    return await Expense.find({companyId}).sort({createdAt:-1});
};  

export const getExpenseById =async(companyId:string,id:string)=>{
    return await Expense.findOne({_id:id,companyId})
};

export const updateExpense =async(companyId:string,id:string,data:any)=>{
    return await Expense.findOneAndUpdate({_id:id,companyId},data,{new:true})
};

export const deleteExpense =async(companyId:string,id:string)=>{
    return await Expense.findOneAndDelete({_id:id,companyId})
};