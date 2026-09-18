import React from 'react'
import { FormField, FormLabel, FormControl, FormMessage } from './ui/form'
import { Input } from './ui/input'

import { Control, FieldPath } from 'react-hook-form'
import { z } from 'zod'
import { authFormSchema } from '@/lib/utils'

interface CustomInputProps {
    control: Control<z.infer<ReturnType<typeof authFormSchema>>>;
    name: FieldPath<z.infer<ReturnType<typeof authFormSchema>>>;
    label: string;
    placeholder: string;
}

const CustomInput = ({ control, name, label, placeholder }: CustomInputProps) => {
    return (
        <FormField
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <div className="form-item">
                    <FormLabel className="form-label">
                        {label}
                    </FormLabel>
                    <div className="flex w-full flex-col">
                        <FormControl>
                            <Input
                                placeholder={placeholder}
                                className="input-class"
                                type={name === 'password' ? 'password' : 'text'}
                                {...field}
                                maxLength={name === 'regionCode' ? 12 : undefined}
                                onChange={(event) => field.onChange(
                                    name === 'regionCode' ? event.target.value.toUpperCase() : event.target.value
                                )}
                            />
                        </FormControl>
                        <FormMessage className="form-message mt-2">{fieldState.error?.message}</FormMessage>
                    </div>
                </div>
            )}
        />
    )
}

export default CustomInput