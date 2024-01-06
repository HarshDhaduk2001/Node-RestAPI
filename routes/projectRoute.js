const express = require("express");
const projectController = require("../controllers/projectController");
const { authenticateJWT } = require("../middlewares/authMiddleware");
const router = express.Router();

router.get("/", authenticateJWT, projectController.getAllProjects);
router.get("/:id", authenticateJWT, projectController.getProjectById);
router.post("/", authenticateJWT, projectController.createProject);
router.post("/:id", authenticateJWT, projectController.updateProject);
router.get("/delete/:id", authenticateJWT, projectController.deleteProject);

module.exports = router;
