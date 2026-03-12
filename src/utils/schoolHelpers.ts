export type SchoolVertical = "School" | "College" | "University";

export const isUniversityLike = (vertical: string): boolean => {
    return vertical === "University" || vertical === "College";
};

export const isK12 = (vertical: string): boolean => {
    return vertical === "School";
};

export const getVerticalLabel = (vertical: string): string => {
    switch (vertical) {
        case "University":
            return "Post-Graduation";
        case "College":
            return "Undergraduate";
        case "School":
        default:
            return "K-12 Education";
    }
};
