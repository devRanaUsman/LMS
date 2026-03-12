# FormInput Component

A reusable form input component that provides a consistent interface for text inputs across the application.

## Features

- **Label with Required Indicator**: Automatically shows a red asterisk (*) for required fields
- **Error Handling**: Displays error messages with red styling
- **Helper Text**: Shows additional context or validation status
- **Consistent Styling**: Automatically applies error styles to the input border
- **Forward Ref Support**: Compatible with React Hook Form's `register` function

## Usage

### Basic Example

```tsx
import { FormInput } from '@/components/ui/FormInput';

<FormInput
    id="email"
    label="Email Address"
    placeholder="user@example.com"
    type="email"
/>
```

### With React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import { FormInput } from '@/components/ui/FormInput';

const { register, formState: { errors } } = useForm();

<FormInput
    id="name"
    label="Full Name"
    required
    placeholder="Enter your name"
    error={errors.name?.message}
    {...register("name")}
/>
```

### With Helper Text

```tsx
<FormInput
    id="username"
    label="Username"
    required
    placeholder="Choose a username"
    helperText="Username must be unique and 3-20 characters"
    error={errors.username?.message}
    {...register("username")}
/>
```

### With Custom Validation Feedback

```tsx
<FormInput
    id="emisCode"
    label="EMIS Code"
    required
    placeholder="e.g. EMIS-2024-001"
    error={errors.emisCode?.message}
    helperText={isChecking ? "Checking availability..." : undefined}
    {...register("emisCode", {
        onBlur: (e) => validateEmis(e.target.value)
    })}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | required | Label text displayed above the input |
| `id` | `string` | required | HTML id for the input element |
| `error` | `string` | - | Error message to display below the input |
| `helperText` | `string` | - | Helper text shown below input (only if no error) |
| `required` | `boolean` | `false` | Shows red asterisk (*) next to label |
| `containerClassName` | `string` | - | Additional classes for the container div |
| `className` | `string` | - | Additional classes for the input element |
| ...rest | `InputHTMLAttributes` | - | All standard input props (type, placeholder, etc.) |

## Styling

The component automatically applies:
- Red border and focus ring when `error` is present
- Error messages in red text (`text-red-500`)
- Helper text in muted slate (`text-slate-500`)
- Consistent spacing with `space-y-2`

## Integration with Validation Libraries

Works seamlessly with:
- **React Hook Form**: Use with `{...register("fieldName")}`
- **Zod**: Pass error messages from `errors.fieldName?.message`
- **Yup**: Compatible with Yup validation schemas
- **Custom Validation**: Pass any error string to the `error` prop
