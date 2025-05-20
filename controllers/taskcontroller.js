import pool from "../db/index.js";
// export const createTask = async (req, res) => {
//     const { title, description } = req.body;
//     const userId = req.user.userId;

//     if (!title) {
//         return res.status(400).json({ message: "title is required" })
//     }

//     try {
//         await pool.query(`INSERT INTO tasks(user_id, title, description, is_completed, created_at) VALUES($1,$2,$3, false, NOW())`,

//             [userId, title, description]);
//         res.status(201).json({ message: "Task created" })
//     } catch (error) {
//         res.status(500).json({ message: "server error" })

//     }
// }


    export const createTask = async (req, res) => {
  try {
    const { title, description } = req.body;
    const userId = req.user?.userId; 

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
        return res.status(400).json({ message: "query parameter is required" })
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

/*
export const getPaginatedTask = async (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const search = req.qurey.search;
    const offset = (page - 1) * limit;

    try {
        const result = await pool.query(`SELECT * FROM tasks WHERE user_id = $1 AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%') ORDER BY created_at DESC LIMIT $2 OFFSET $3`,
            [userId, limit, offset, search]);
        
        const meta = {
            currentPage: page,
            limit,
            totalDocs
            
        }
        res.json(result.rows, )
    } catch (error) {
        res.status(500).json({ message: "server not found" })

    }
}
*/

export const getTasks = async (req, res) => {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = (req.query.search);
    const offset = (page - 1) * limit;

    try {
        const countResult = await pool.query(`
            SELECT COUNT(*) FROM tasks 
            WHERE user_id = $1 
            AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%')
        `, [userId, search]);

        const totalDocs = parseInt(countResult.rows[0].count);

        const result = await pool.query(`
            SELECT * FROM tasks 
            WHERE user_id = $1 
            AND (title ILIKE '%' || $2 || '%' OR description ILIKE '%' || $2 || '%') 
            ORDER BY created_at DESC 
            LIMIT $3 OFFSET $4
        `, [userId, search, limit, offset]);

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
