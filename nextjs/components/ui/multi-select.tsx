// src/components/multi-select.tsx

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import {
  CheckIcon,
  XCircle,
  ChevronDown,
  XIcon,
  WandSparkles,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "../ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../ui/command";
import Image from "next/image";

/**
 * Variants for the multi-select component to handle different styles.
 * Uses class-variance-authority (cva) to define different styles based on "variant" prop.
 */
const multiSelectVariants = cva("m-1 transition ease-in-out", {
  variants: {
    variant: {
      default: "border-foreground/10 text-foreground bg-card hover:bg-card/80",
      secondary:
        "border-foreground/10 bg-secondary text-secondary-foreground hover:bg-secondary/80",
      destructive:
        "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
      inverted: "inverted bg-white",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

/**
 * Props for MultiSelect component
 */
interface MultiSelectProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof multiSelectVariants> {
  /**
   * An array of option objects to be displayed in the multi-select component.
   * Each option object has a label, value, and an optional icon.
   */
  options: {
    /** The text to display for the option. */
    label: React.ReactNode | string;
    /** The unique value associated with the option. */
    value: string;
    /** Optional icon component to display alongside the option. */
    icon?: React.ComponentType<{ className?: string }>;

    subLabel?: string;
    /** Whether this option is registered (for styling purposes) */
    isRegistered?: boolean;
  }[];

  /**
   * Callback function triggered when the selected values change.
   * Receives an array of the new selected values.
   */
  onValueChange: (value: string[]) => void;

  /** The default selected values when the component mounts. */
  defaultValue?: string[];

  /**
   * Placeholder text to be displayed when no values are selected.
   * Optional, defaults to "Select options".
   */
  placeholder?: string;

  /**
   * Animation duration in seconds for the visual effects (e.g., bouncing badges).
   * Optional, defaults to 0 (no animation).
   */
  animation?: number;

  /**
   * Maximum number of items to display. Extra selected items will be summarized.
   * Optional, defaults to 3.
   */
  maxCount?: number;

  /**
   * The modality of the popover. When set to true, interaction with outside elements
   * will be disabled and only popover content will be visible to screen readers.
   * Optional, defaults to false.
   */
  modalPopover?: boolean;

  /**
   * If true, renders the multi-select component as a child of another component.
   * Optional, defaults to false.
   */
  asChild?: boolean;

  /**
   * Additional class names to apply custom styles to the multi-select component.
   * Optional, can be used to add custom styles.
   */
  className?: string;
}

export const MultiSelect = React.forwardRef<
  HTMLButtonElement,
  MultiSelectProps & { allTitle?: string }
>(
  (
    {
      options,
      onValueChange,
      variant,
      defaultValue = [],
      value,
      placeholder = "Select options",
      animation = 0,
      maxCount = 3,
      modalPopover = false,
      asChild = false,
      className,
      allTitle = "Select All",
      ...props
    },
    ref
  ) => {
    const [selectedValues, setSelectedValues] =
      React.useState<string[]>(defaultValue);
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);
    const [isAnimating, setIsAnimating] = React.useState(false);

    // Add this effect to sync with external value
    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValues(value as string[]);
      }
    }, [value]);

    const handleInputKeyDown = (
      event: React.KeyboardEvent<HTMLInputElement>
    ) => {
      if (event.key === "Enter") {
        setIsPopoverOpen(true);
      } else if (event.key === "Backspace" && !event.currentTarget.value) {
        const newSelectedValues = [...selectedValues];
        newSelectedValues.pop();
        setSelectedValues(newSelectedValues);
        onValueChange(newSelectedValues);
      }
    };

    const toggleOption = (option: string) => {
      const newSelectedValues = selectedValues.includes(option)
        ? selectedValues.filter((value) => value !== option)
        : [...selectedValues, option];
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const handleClear = () => {
      setSelectedValues([]);
      onValueChange([]);
    };

    const handleTogglePopover = () => {
      setIsPopoverOpen((prev) => !prev);
    };

    const clearExtraOptions = () => {
      const newSelectedValues = selectedValues.slice(0, maxCount);
      setSelectedValues(newSelectedValues);
      onValueChange(newSelectedValues);
    };

    const toggleAll = () => {
      if (selectedValues.length === options.length) {
        handleClear();
      } else {
        const allValues = options.map((option) => option.value);
        setSelectedValues(allValues);
        onValueChange(allValues);
      }
    };

    return (
      <Popover
        open={isPopoverOpen}
        onOpenChange={setIsPopoverOpen}
        modal={modalPopover}
      >
        <PopoverTrigger asChild disabled={props.disabled}>
          <Button
            ref={ref}
            {...props}
            type="button"
            onClick={props.disabled ? undefined : handleTogglePopover}
            disabled={props.disabled}
            className={cn(
              "flex w-full p-1 rounded-md border min-h-10 h-auto items-center justify-between bg-white hover:bg-inherit",
              props.disabled && "opacity-50 cursor-not-allowed",
              className
            )}
          >
            {selectedValues.length > 0 ? (
              <div className="flex justify-between items-center w-full">
                <div className="flex flex-wrap items-center">
                  {selectedValues.slice(0, maxCount).map((value) => {
                    const option = options.find((o) => o.value === value);
                    const IconComponent = option?.icon;
                    const isRegistered = option?.isRegistered || false;
                    return (
                      <Badge
                        key={value}
                        className={cn(
                          isAnimating ? "" : "",
                          multiSelectVariants({ variant: "default" }),
                          isRegistered
                            ? "bg-blue-100 text-blue-800 font-medium text-xs gap-2"
                            : "bg-[#F2F4F7] text-[#344054] font-medium text-xs gap-2"
                        )}
                        style={{ animationDuration: `${animation}s` }}
                      >
                        {IconComponent && (
                          <IconComponent className="h-4 w-4 mr-2" />
                        )}
                        {option?.label}
                        <Image
                          src="/close.svg"
                          alt=""
                          width={16}
                          height={16}
                          className="h-4 w-4 cursor-pointer"
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleOption(value);
                          }}
                        />
                      </Badge>
                    );
                  })}
                  {selectedValues.length > maxCount && (
                    <p className="text-xs font-medium">{` ${
                      selectedValues.length - maxCount
                    } more`}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <ChevronDown className="h-4 mx-2 cursor-pointer text-muted-foreground" />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full mx-auto">
                <span className="text-sm text-[#101828] font-normal mx-3">
                  {placeholder}
                </span>
                <ChevronDown className="h-4 cursor-pointer text-muted-foreground mx-2" />
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-full p-0"
          align="start"
          onEscapeKeyDown={() => setIsPopoverOpen(false)}
        >
          <div className="w-[438px]">
            <Command>
              <CommandInput
                placeholder="Search"
                onKeyDown={handleInputKeyDown}
              />
              <CommandList>
                <CommandEmpty>No results found.</CommandEmpty>
                <CommandGroup>
                  {options.length > 0 ? (
                    <>
                      <CommandItem
                        key="all"
                        onSelect={toggleAll}
                        className="cursor-pointer p-2"
                      >
                        <p className="text-[#475467] font-medium flex-grow">
                          {allTitle}
                        </p>
                        {selectedValues.length === options.length && (
                          <Image
                            src="/check.svg"
                            alt=""
                            width={20}
                            height={20}
                            className="h-5 w-5"
                          />
                        )}
                      </CommandItem>
                      {options.map((option) => {
                        const isSelected = selectedValues.includes(
                          option.value
                        );
                        return (
                          <CommandItem
                            key={option.value}
                            onSelect={() => toggleOption(option.value)}
                            className={`cursor-pointer rounded-lg p-2 ${
                              option.isRegistered
                                ? "bg-blue-50 hover:bg-blue-100"
                                : ""
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-grow">
                              {option.icon && (
                                <option.icon className="pr-2 h-4 w-4 text-muted-foreground" />
                              )}
                              <div>
                                <p
                                  className={`text-sm font-medium ${
                                    option.isRegistered ? "text-blue-800" : ""
                                  }`}
                                >
                                  {option.label}
                                </p>
                                {option?.subLabel && (
                                  <p
                                    className={`text-sm ${
                                      option.isRegistered
                                        ? "text-blue-600"
                                        : "text-[#475467]"
                                    }`}
                                  >
                                    {option.subLabel}
                                  </p>
                                )}
                              </div>
                            </div>
                            {isSelected && (
                              <Image
                                src="/check.svg"
                                alt=""
                                width={20}
                                height={20}
                                className="h-5 w-5 ml-3"
                              />
                            )}
                          </CommandItem>
                        );
                      })}
                    </>
                  ) : (
                    <CommandItem
                      key="no-options"
                      disabled
                      className="cursor-not-allowed p-2 text-gray-500"
                    >
                      <p className="text-sm">{placeholder}</p>
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </div>
        </PopoverContent>
      </Popover>
    );
  }
);

MultiSelect.displayName = "MultiSelect";
