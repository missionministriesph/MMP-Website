// Imports Modules
import express from "express";
import { validationResult } from "express-validator";
import { allowed } from "../utils/helpers.js";
import {
    validateDetailsReqBody,
    cleanDetailsObject,
} from "../validators/ModuleDetailsValidator.js";
import { db as prisma } from "../utils/db.server.js";

// Express Router
const ModuleDetailsRouter = express.Router();

/* Helper Functions */
const module_exists = async (name) => {
    const record = await prisma.Module_Names.findUnique({
        where: {
            module_name: name,
        },
    });

    if (record) {
        return true;
    } else {
        return false;
    }
};

/* GET Endpoints */
//Get details of a module
ModuleDetailsRouter.get("/info/:module_name", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        const { module_name } = req.params;

        //Check for existence
        if (!(await module_exists(module_name))) {
            res.status(404).send({ error: "Module does not exist!" });
            return;
        }

        //Get record
        const details = await prisma.Module_Details.findUnique({
            where: {
                module_name: module_name,
            },
        });

        if (details.length !== 0) {
            res.status(200).send(details);
        } else {
            res.status(404).send({ error: "Module does not exist!" });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all module names
ModuleDetailsRouter.get("/all", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get names
        const names = await prisma.Module_Names.findMany({
            orderBy: {
                module_name: "asc",
            }
    });

        res.status(200).send(names);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

//Get all module details
ModuleDetailsRouter.get("/all/details", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get records
        const records = await prisma.Module_Details.findMany({
            orderBy: {
                module_name: "asc",
            }
    })

        res.status(200).send(records);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* POST Endpoints */
//Create a new module entry
ModuleDetailsRouter.post("/", validateDetailsReqBody(), async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    // Validate Details Info
    const result = validationResult(req);
    if (!result.isEmpty()) {
        // Return errors if any
        return res.status(400).send({ errors: result.array() });
    }

    try {
        //Get info from body
        const details = cleanDetailsObject(req.body);

        //Validate if the prerequisites are valid
        let invalid_requisites = [];
        for (const name of details.prerequisites) {
            if (!(await module_exists(name))) {
                invalid_requisites.push(name);
            }
        }

        //End early if there are invalid prerequisites
        if (invalid_requisites.length > 0) {
            res.status(400).send({ error: `Invalid Prerequisites: ${invalid_requisites}` });
            return;
        }

        //Create the module name entry
        await prisma.Module_Names.create({
            data: { module_name: details.module_name },
        });

        //Create the module details entry
        await prisma.Module_Details.create({
            data: details,
        });

        res.status(200).send({ message: `Successfully created ${details.module_name}` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

/* PATCH Endpoints */
//Update a module detail
ModuleDetailsRouter.patch("/:module_name", async (req, res) => {
    if (!allowed(req.permission, [3])) {
        res.status(403).send({ error: "You are not authorized to access this" });
        return;
    }

    try {
        //Get info from body
        const { prerequisites } = req.body;

        //Validate if the prerequisites are valid
        let invalid_requisites = [];
        for (const name of prerequisites) {
            if (!(await module_exists(name))) {
                invalid_requisites.push(name);
            }
        }

        //End early if there are invalid prerequisites
        if (invalid_requisites.length > 0) {
            res.status(400).send({ error: `Invalid Prerequisites: ${invalid_requisites}` });
            return;
        }

        await prisma.Module_Details.update({
            where: {
                module_name: req.params.module_name,
            },
            data: { prerequisites: prerequisites },
        });

        res.status(200).send({ message: `Successfully updated ${req.params.module_name}` });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

export default ModuleDetailsRouter;
