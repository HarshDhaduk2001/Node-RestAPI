const db = require("../config/db");
const { verifyJWT } = require("../middlewares/authMiddleware");
require("dotenv").config();

const handleError = (res, statusCode, errorMessage) => {
  return res
    .status(statusCode)
    .json({ status: "failure", error: errorMessage });
};

const executeQuery = async (query, params) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

exports.getAllProjects = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return handleError(res, 401, "Unauthorized: Token missing");
    }

    const verify = await verifyJWT(token);
    if (!verify) {
      return handleError(res, 403, "Invalid token");
    }

    const query = "SELECT * FROM project WHERE user_id = ? AND deleted_at = 0";
    const projects = await executeQuery(query, [verify.id]);

    res.status(200).json({ status: "success", projects });
  } catch (error) {
    handleError(res, 500, "Internal Server Error");
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return handleError(res, 401, "Unauthorized: Token missing");
    }

    const verify = await verifyJWT(token);
    if (!verify) {
      return handleError(res, 403, "Invalid token");
    }

    const id = req.params.id;
    if (isNaN(id) || id <= 0) {
      return handleError(res, 400, "Invalid user ID");
    }

    const projectQuery = "SELECT * FROM project WHERE id = ? AND deleted_at=0";
    const projectResults = await executeQuery(projectQuery, [id]);

    if (projectResults.length === 0) {
      return handleError(res, 401, "Project does not exist.");
    }

    const userProjectQuery =
      "SELECT * FROM project WHERE id = ? AND user_id = ?";
    const userProjectResults = await executeQuery(userProjectQuery, [
      id,
      verify.id,
    ]);

    if (userProjectResults.length === 0) {
      return handleError(res, 404, "Project not found");
    }

    res
      .status(200)
      .json({ status: "success", responseData: userProjectResults[0] });
  } catch (error) {
    handleError(res, 500, "Internal Server Error");
  }
};

exports.createProject = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return handleError(res, 401, "Unauthorized: Token missing");
    }

    const verify = await verifyJWT(token);
    if (!verify) {
      return handleError(res, 403, "Invalid token");
    }

    const { name } = req.body;

    if (!name) {
      return handleError(res, 400, "Name is required");
    }

    const insertQuery = "INSERT INTO project SET ?";
    await executeQuery(insertQuery, { name, user_id: verify.id });

    res
      .status(200)
      .json({ status: "success", message: "Project created successfully." });
  } catch (error) {
    handleError(res, 500, "Internal Server Error");
  }
};

exports.updateProject = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return handleError(res, 401, "Unauthorized: Token missing");
    }

    const verify = await verifyJWT(token);
    if (!verify) {
      return handleError(res, 403, "Invalid token");
    }

    const { id, name } = req.body;

    if (isNaN(id) || id <= 0) {
      return handleError(res, 400, "Invalid ID");
    }

    if (!name) {
      return handleError(res, 400, "Name and ID are required");
    }

    const projectQuery = "SELECT * FROM project WHERE id = ? AND deleted_at=0";
    const projectResults = await executeQuery(projectQuery, [id]);

    if (projectResults.length === 0) {
      return handleError(res, 401, "Project does not exist.");
    }

    const updateQuery = "UPDATE project SET name = ? WHERE id = ?";
    await executeQuery(updateQuery, [name, id]);

    res
      .status(200)
      .json({ status: "success", message: "Project updated successfully" });
  } catch (error) {
    handleError(res, 500, "Internal Server Error");
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const token = req.headers.authorization?.substring(7);
    if (!token) {
      return handleError(res, 401, "Unauthorized: Token missing");
    }

    const verify = await verifyJWT(token);
    if (!verify) {
      return handleError(res, 403, "Invalid token");
    }

    const id = req.params.id;

    if (isNaN(id) || id <= 0) {
      return handleError(res, 400, "Invalid user ID");
    }

    const projectQuery = "SELECT * FROM project WHERE id = ? AND deleted_at=0";
    const projectResults = await executeQuery(projectQuery, [id]);

    if (projectResults.length === 0) {
      return handleError(res, 401, "Project does not exist.");
    }

    const deleteQuery = "UPDATE project SET deleted_at = 1 WHERE id = ?";
    const deleteResults = await executeQuery(deleteQuery, [id]);

    if (deleteResults.affectedRows === 0) {
      return handleError(res, 404, "Project not found");
    }

    res
      .status(200)
      .json({ status: "success", message: "Project deleted successfully" });
  } catch (error) {
    handleError(res, 500, "Internal Server Error");
  }
};
