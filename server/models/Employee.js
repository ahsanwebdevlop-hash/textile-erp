import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  employeeCode: { type: String, trim: true },
  name: { type: String, required: [true, 'Name is required'], trim: true },
  department: { type: String, required: [true, 'Department is required'], enum: ['Production', 'Cutting', 'Sewing', 'Finishing', 'Quality Control', 'Warehouse', 'Design', 'Sales', 'Accounts', 'Administration', 'Maintenance'] },
  role: { type: String, required: [true, 'Role is required'] },
  assignedLineStation: { type: String, default: 'Unassigned' },
  phone: { type: String, required: [true, 'Phone is required'], trim: true },
  email: { type: String, trim: true, lowercase: true },
  joiningDate: { type: Date, default: Date.now },
  basicSalary: { type: Number, default: 0 },
  status: { type: String, enum: ['Active', 'On Leave', 'Resigned', 'Terminated'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
export default Employee;
