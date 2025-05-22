import pool from "../db/index.js";
import { createTaksSchema, taskListReqeuest } from "../zod/task.js"




export const createTask = async (req, res) => {
    try {
        console.log("req.body===>", req.body)
        const { success = false, error = null, data } = createTaksSchema.safeParse(req.body);
        console.log("success=====>", data)
        console.log("error=====>", data)
        if (!success) {
            console.log("error==>", error)
            return res.status(400).json({ error: "Invalid request body" });
        }
        //const { title, description } = data;
        const { title, description } = data;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        if (!title) {
            return res.status(400).json({ error: "Title is required" });
        }

        const result = await pool.query(
            "INSERT INTO tasks (title, description, user_id) VALUES ($1, $2, $3) RETURNING *",
            [title, description, userId]
        );

        res.status(201).json({ task: result.rows[0] });
    } catch (error) {
        console.error("Create Task Error:", error);
        res.status(500).json({ message: "server error", error: error.message });
    }
};

export const searchTask = async (req, res) => {
    const userId = req.user.userId;
    const keyword = req.query.q;

    if (!keyword) {
        return res.status(400).json({ message: "query parameter q is required" })
    }
    try {
        const result = await pool.query(`
           SELECT * FROM tasks 
       WHERE user_id = $1 
       AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%') 
       ORDER BY created_at DESC`,
            [userId, keyword]
        );

        res.json(result.rows)
    } catch (error) {
        res.status(400).json({ message: "Server error" })

    }
}



export const getTasks = async (req, res) => {
   const result = taskListReqeuest.safeParse(req.query);
    const { page, limit, search } = result.data;
    const userId = req.user.id;
    // const page = parseInt(req.query.page);
    // const limit = parseInt(req.query.limit);
    // const search = req.query?.search;
    const offset = (page - 1) * limit;
    console.log("userId",userId)


    try {
        let query = `SELECT COUNT(*) FROM tasks 
            WHERE user_id = $1`
        let params = [userId];

        if (search) {
            query += ` AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')`
            params.push(search);

        }


        const countResult = await pool.query(query, params);

        const totalDocs = parseInt(countResult.rows[0].count);
        console.log({ totalDocs })

        let params1 = [userId];

        let q1 = `SELECT * FROM tasks WHERE user_id = $1 `

        if (search) {
            q1 += ` AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')`
            params1.push(search);
        }
        q1 += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params1.push(limit, offset)

        console.log("q1", q1)
        const result = await pool.query(q1, params1);

        // console.log("result==>", result);
        const meta = {
            currentPage: page,
            limit: limit,
            totalDocs: totalDocs,
            totalPages: Math.ceil(totalDocs / limit),
        };

        res.json({ tasks: result.rows, meta });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

export const markTaskDone = async (req, res) => {
    const userId = req.user.userId;
    const taskId = parseInt(req.params.id);
    try {
        // const result = Task.findByIdAndUpdate(id, req.body)
        const taskResult = await pool.query(
            'SELECT * FROM tasks WHERE id = $1 AND user_id = $2',
            [taskId, userId]
        );

        if (taskResult.rows.length === 0) {
            return res.status(404).json({ message: 'Task not found or not authorized' });
        }

        await pool.query('UPDATE tasks SET done = true WHERE id = $1', [taskId]);

        res.json({ message: 'Task marked as done' });
    } catch (err) {
        console.error('Error marking task done:', err);
        res.status(500).json({ message: 'Server error' });
    }
};
