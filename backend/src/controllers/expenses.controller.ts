import { getExpenses, getExpenseById, createExpense, updateExpense, deleteExpense } from "../services/expenses.js";
import { Request, Response } from "express";

export const getExpensesController = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        if (!companyId) {
            res.status(400).json({ message: "Company context is required" });
            return;
        }
        const expenses = await getExpenses(companyId);
        res.status(200).json({ data: expenses, message: "Expenses fetched successfully" });
    } catch (error) {
        console.error("Error fetching expenses:", error);
        res.status(500).json({ message: "Error fetching expenses" });
    }
};

export const getExpenseByIdController = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        if (!companyId) {
            res.status(400).json({ message: "Company context is required" });
            return;
        }
        const expenseId = req.params.id as string;
        const expense = await getExpenseById(companyId, expenseId);
        if (!expense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json(expense);
    } catch (error) {
        console.error("Error fetching expense:", error);
        res.status(500).json({ message: "Error fetching expense" });
    }   
};

export const createExpenseController = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        if (!companyId) {
            res.status(400).json({ message: "Company context is required" });
            return;
        }
        const expenseData = req.body;
        const newExpense = await createExpense({ ...expenseData, companyId, userId: req.userId! });
        res.status(201).json({ data: newExpense, message: "Expense created successfully" });
    } catch (error) {
        console.error("Error creating expense:", error);
        res.status(500).json({ message: "Error creating expense", error: error instanceof Error ? error.message : "Unknown error" });
    }   
};

export const updateExpenseController = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        if (!companyId) {
            res.status(400).json({ message: "Company context is required" });
            return;
        }
        const expenseId = req.params.id as string;
        const expenseData = req.body;
        const updatedExpense = await updateExpense(companyId, expenseId, expenseData);
        if (!updatedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }
        res.status(200).json(updatedExpense);
    } catch (error) {
        console.error("Error updating expense:", error);
        res.status(500).json({ message: "Error updating expense" });
    }   
};

export const deleteExpenseController = async (req: Request, res: Response) => {
    try {
        const companyId = (req as any).companyId;
        if (!companyId) {
            res.status(400).json({ message: "Company context is required" });
            return;
        }
        const expenseId = req.params.id as string;
        const deletedExpense = await deleteExpense(companyId, expenseId);
        if (!deletedExpense) {
            return res.status(404).json({ message: "Expense not found" });
        }   
        res.status(200).json({ message: "Expense deleted successfully" });
    } catch (error) {
        console.error("Error deleting expense:", error);
        res.status(500).json({ message: "Error deleting expense" });
    }
};
