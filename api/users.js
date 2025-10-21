import express from 'express';
import bcrypt from 'bcrypt'; // Add this import
const router = express.Router();
export default router;

import { createUser, login } from '#db/queries/users';
import requireBody from '#middleware/requireBody';
import { createToken } from '#utils/jwt';

router 
    .route('/')
    .get((req, res) => {
        res.send('User endpoint is working');
    })

router
    .route('/register')
    .get((req, res) => {
        res.send('User register endpoint is working');
    })
    .post(requireBody(["username", "password"]), async(req, res) => {
        try {
            const { username, password } = req.body;
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await createUser({ username, hashedPassword });
            const token = createToken({ id: user.id });
            res.status(201).send(token);
        } catch (err) {
            console.error(error);
            res.status(500).send('Registration failed');
        }
    });

router
    .route('/login')
    .post(requireBody(["username", "password"]), async(req, res) => {
        try {
            const { username, password } = req.body;
            const user = await login({ username });
            if (!user) {
                return res.status(401).send('Invalid username or password.');
            }
            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return res.status(401).send('Invalid username or password.');
            }
            const token = createToken({ id: user.id });
            res.status(200).send(token);
        } catch (err) {
            console.error(error);
            res.status(500).send('Login failed');
        }
    });