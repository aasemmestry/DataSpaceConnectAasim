import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { UserRole, registerSchema, RegisterRequest } from '@dataspace/common';

export const RegisterForm: React.FC<{ onSubmit: (data: RegisterRequest) => void }> = ({ onSubmit }) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterRequest>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: UserRole.SEEKER,
    }
  });

  const currentRole = watch('role');

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Name</label>
        <input {...register('name')} className="border p-2 w-full" />
      </div>
      <div>
        <label>Company Name</label>
        <input {...register('companyName')} className="border p-2 w-full" />
        {errors.companyName && <p className="text-red-500">{errors.companyName.message}</p>}
      </div>
      <div>
        <label>Email</label>
        <input {...register('email')} className="border p-2 w-full" />
        {errors.email && <p className="text-red-500">{errors.email.message}</p>}
      </div>
      <div>
        <label>Password</label>
        <input type="password" {...register('password')} className="border p-2 w-full" />
        {errors.password && <p className="text-red-500">{errors.password.message}</p>}
      </div>
      
      <div className="flex items-center space-x-4">
        <label>Role:</label>
        <button
          type="button"
          onClick={() => setValue('role', UserRole.OFFERER)}
          className={`px-4 py-2 rounded ${currentRole === UserRole.OFFERER ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          I have a Datacenter
        </button>
        <button
          type="button"
          onClick={() => setValue('role', UserRole.SEEKER)}
          className={`px-4 py-2 rounded ${currentRole === UserRole.SEEKER ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          I need Resources
        </button>
      </div>

      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded w-full">
        Register
      </button>
    </form>
  );
};
