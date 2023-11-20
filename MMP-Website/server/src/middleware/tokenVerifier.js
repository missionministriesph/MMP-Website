// Import Modules
import jwt from "jsonwebtoken";

// Verify token
export const verifyToken = async (req, res, next) => {
    /* Permission Types
    0 - Guest Permission
    1 - Student Permission
    2 - Teacher Permission
    3 - Admin Permission
    */

    let permission = 0;

    // TODO: Add account_type checking for routes that require it
    try {
        // Get token from request header
        let token = req.header("Authorization");

        // If no token: respond with error
        if (!token || token === undefined) {
            permission = 0;
        } else {
            // If token starts with "Bearer ": remove it
            if (token.startsWith("Bearer ")) {
                token = token.slice(7, token.length).trimLeft();
            }

            jwt.verify(token, process.env.JWT_SECRET, (error, user) => {
                // If verification failed: respond with error
                if (error) {
                    throw new Error("Token verification failed");
                }

                // Set permissions based on account types
                switch (user.account_type) {
                    case "student":
                        permission = 1;
                        break;
                    case "teacher":
                        permission = 2;
                        break;
                    case "admin":
                        permission = 3;
                        break;
                    default:
                        throw new Error("There was an error with the user's account type");
                }

                // Assign user to req.user
                req.user = user;
            });
        }

        req.permission = permission;
        next();
    } catch (error) {
        // Respond with error
        res.status(500).json({ error: error.message });
    }
};
