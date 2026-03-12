# Loader Usage Guide

This project uses a standardized loader system to enhance UX and provide consistent feedback without full-page reloads.

## 1. PageLoader (`components/ui/loaders/PageLoader.tsx`)
Use `PageLoader` for initial data fetching on a page or route transitions.
```tsx
import { PageLoader } from "@/components/ui/loaders/PageLoader";

if (isLoading) {
    return <PageLoader text="Loading department staffing..." />;
}
```
**Props:**
- `text`: String to display below the loader (default: "Loading...")
- `overlay`: If true, covers the entire screen over existing content (useful for blocking interactions during critical loads).

## 2. LogoLoader (`components/ui/loaders/LogoLoader.tsx`)
The core animated loader. Use this inside containers where `PageLoader` might be too opinionated, or embed it in empty states.
```tsx
import { LogoLoader } from "@/components/ui/loaders/LogoLoader";

return <LogoLoader size="md" />;
```
**Props:** `size` ("sm", "md", "lg", "xl")

## 3. Skeleton (`components/ui/loaders/Skeleton.tsx`)
Use for inline loading states like table rows, dashboard cards, or lists while data refetches.
```tsx
import { Skeleton } from "@/components/ui/loaders/Skeleton";

return <div className="space-y-2">
    <Skeleton className="h-4 w-[250px]" />
    <Skeleton className="h-4 w-[200px]" />
</div>
```

## 4. Button Loaders (`components/ui/button.tsx`)
Automatically handles loading spinners, disables the button to prevent multiple clicks, and avoids layout shifts.
```tsx
import { Button } from "@/components/ui/button";

return (
    <Button 
        isLoading={isSubmitting} 
        disabled={isSubmitting} // Can be explicitly passed for extra safety or custom logic
        onClick={handleSave}
    >
        Save Changes
    </Button>
);
```
**Key Rule for Mutations:** Do NOT use `window.location.reload()` after an action. Make your API call, update the local component state, and show a success toast. If you must refetch, do it silently in the background without setting the main `isLoading` to true.
