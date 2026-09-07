import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: { type: String, required: [true, 'Email is required'], unique: true, lowercase: true, trim: true },
  password: { type: String, required: [true, 'Password is required'], minlength: [6, 'Password must be at least 6 characters'] },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  role: { 
    type: String, 
    enum: [
      'super_admin', 
      'admin', 
      'manager', 
      'production_manager', 
      'inventory_manager', 
      'accounts_manager', 
      'purchase_manager', 
      'sales_manager', 
      'quality_manager', 
      'employee'
    ], 
    default: 'admin' 
  },
  department: { type: String, default: 'General' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  active: { type: Boolean, default: true }
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
