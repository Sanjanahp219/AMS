import express from 'express';
import { Department } from '../models/department.js';

const router = express.Router();


// fetch all data
router.get('/', async(req, res) => {
    try{
        const departments = await Department.find().sort({ createdAt: -1});
        res.json(departments);

    }
    catch(error){
        res.status(500).json({message: error.message});
    }
});



// get by Id
router.get('/:id', async(req, res) => {

    try{
        const department = await Department.findById(req.params.id);
        if(!department){
            return res.status(404).json({message: 'Department not found'});

        }
        res.json(department);

    }
    catch(error){
        res.status(500).json({message: error.message})
    }
})


// 3. CREATE DEPARTMENT -> POST /api/departments

router.post('/', async (req, res) => {
  try {
    const newDepartment = new Department(req.body);
    const savedDepartment = await newDepartment.save();
    res.status(201).json(savedDepartment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// 4. UPDATE DEPARTMENT -> PUT /api/departments/:id

router.put('/:id', async (req, res) => {
  try {
    const updated = await Department.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});



// 5. DELETE DEPARTMENT -> DELETE /api/departments/:id
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await Department.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Department not found' });
    }
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;

