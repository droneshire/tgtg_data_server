import BathtubIcon from '@mui/icons-material/Bathtub';
import BedIcon from '@mui/icons-material/Bed';
import PaidIcon from '@mui/icons-material/Paid';
import SquareFootIcon from '@mui/icons-material/SquareFoot';

import { NestedKeyOf } from "utils/generics";
import { ClientConfig } from 'types/user';

interface SearchParamsSliderListProps {
    label: string;
    key: string;
    icon: React.ElementType;
    fieldPathMin: NestedKeyOf<ClientConfig>;
    fieldPathMax: NestedKeyOf<ClientConfig>;
    min: number;
    max: number;
    step: number;
}

const searchParamsSliderList: SearchParamsSliderListProps[] = [
    {
        label: "Price",
        key: "price",
        icon: PaidIcon,
        fieldPathMin: "searchParams.minPrice",
        fieldPathMax: "searchParams.maxPrice",
        min: 0,
        max: 2000000,
        step: 10000,
    },
    {
        label: "Beds",
        key: "beds",
        icon: BedIcon,
        fieldPathMin: "searchParams.minBeds",
        fieldPathMax: "searchParams.maxBeds",
        min: 0,
        max: 5,
        step: 1,
    },
    {
        label: "Baths",
        key: "baths",
        icon: BathtubIcon,
        fieldPathMin: "searchParams.minBaths",
        fieldPathMax: "searchParams.maxBaths",
        min: 1,
        max: 5,
        step: 1,
    },
    {
        label: "Sqft",
        key: "sqft",
        icon: SquareFootIcon,
        fieldPathMin: "searchParams.minSize",
        fieldPathMax: "searchParams.maxSize",
        min: 0,
        max: 5000,
        step: 100,
    },
];

export default searchParamsSliderList;
