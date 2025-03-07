import React, { useCallback, useContext, useMemo } from "react";
import { DEFAULT_THEME } from "../constants";

import DisabledItem from "./DisabledItem";
import GroupItem from "./GroupItem";
import Item from "./Item";
import { SelectContext } from "./SelectProvider";
import { Option, Options as ListOption } from "./type";
import {removeVietnameseTones} from "./Select";


interface OptionsProps {
    list: ListOption;
    noOptionsMessage: string;
    text: string;
    isMultiple: boolean;
    value: Option | Option[] | null;
    primaryColor: string;
}

const Options: React.FC<OptionsProps> = ({
    list,
    noOptionsMessage,
    text,
    isMultiple,
    value,
    primaryColor = DEFAULT_THEME
}) => {
    const { classNames } = useContext(SelectContext);

    // Hàm dùng để lọc options theo text
    const filterByText = useCallback(() => {
        // Chuẩn hóa chuỗi tìm kiếm
        const normalizedSearch = removeVietnameseTones(text.toLowerCase());

        // Lọc 1 item
        const filterItem = (item: Option) => {
            const normalizedLabel = removeVietnameseTones(item.label.toLowerCase());
            return normalizedLabel.includes(normalizedSearch);
        };

        // Duyệt qua list, nếu là group thì lọc từng phần tử
        let result = list.map(item => {
            if ("options" in item) {
                return {
                    label: item.label,
                    options: item.options.filter(filterItem)
                };
            }
            return item;
        });

        // Loại bỏ những group không có option con
        result = result.filter(item => {
            if ("options" in item) {
                return item.options.length > 0;
            }
            return filterItem(item);
        });

        return result;
    }, [text, list]);

    // Nếu isMultiple, loại bỏ các item đã được chọn
    const removeValues = useCallback(
        (array: ListOption) => {
            if (!isMultiple) {
                return array;
            }

            if (Array.isArray(value)) {
                const valueId = value.map(item => item.value);

                const filterItem = (item: Option) => !valueId.includes(item.value);

                let newArray = array.map(item => {
                    if ("options" in item) {
                        return {
                            label: item.label,
                            options: item.options.filter(filterItem)
                        };
                    }
                    return item;
                });

                newArray = newArray.filter(item => {
                    if ("options" in item) {
                        return item.options.length > 0;
                    } else {
                        return filterItem(item);
                    }
                });

                return newArray;
            }
            return array;
        },
        [isMultiple, value]
    );

    // Tạo danh sách cuối cùng để render
    const filterResult = useMemo(() => {
        return removeValues(filterByText());
    }, [filterByText, removeValues]);

    return (
        <div
            role="options"
            className={
                classNames && classNames.list
                    ? classNames.list
                    : "max-h-72 overflow-y-auto"
            }
        >
            {filterResult.map((item, index) => (
                <React.Fragment key={index}>
                    {"options" in item ? (
                        <>
                            <div className="px-2.5">
                                <GroupItem
                                    primaryColor={primaryColor || DEFAULT_THEME}
                                    item={item}
                                />
                            </div>
                            {index + 1 < filterResult.length && <hr className="my-1" />}
                        </>
                    ) : (
                        <div className="px-2.5">
                            <Item primaryColor={primaryColor || DEFAULT_THEME} item={item} />
                        </div>
                    )}
                </React.Fragment>
            ))}
            {filterResult.length === 0 && <DisabledItem>{noOptionsMessage}</DisabledItem>}
        </div>
    );
};

export default Options;
