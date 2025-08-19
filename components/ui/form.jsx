// ui/form.jsx (React Native)
"use client";

import React from "react";
import { View, Text } from "react-native";
import {
  Controller,
  FormProvider,
  useFormContext,
  useFormState,
} from "react-hook-form";
import { cn } from "./utils.js";

// 웹과 동일한 API를 유지하려고 이름을 맞춰둠
export const Form = FormProvider;

const FormFieldContext = React.createContext({ name: "" });
const FormItemContext = React.createContext({ id: "" });

export function FormField(props) {
  const { name } = props;
  return (
    <FormFieldContext.Provider value={{ name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
}

export function useFormField() {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState } = useFormContext();
  const formState = useFormState({ name: fieldContext.name });
  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext || !fieldContext.name) {
    throw new Error("useFormField must be used within <FormField>");
  }

  const { id } = itemContext;
  return {
    id,
    name: fieldContext.name,
    // RN에선 aria/id 연결이 없으므로 아래 값들은 웹과의 호환용으로만 둠
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState, // { invalid, error, isTouched, isDirty }
  };
}

export function FormItem({ className, children, ...props }) {
  // RN의 useId는 웹만큼 의미 없지만, 호환용으로 유지
  const id = React.useId ? React.useId() : Math.random().toString(36).slice(2);

  return (
    <FormItemContext.Provider value={{ id }}>
      <View data-slot="form-item" className={cn("gap-2", className)} {...props}>
        {children}
      </View>
    </FormItemContext.Provider>
  );
}

export function FormLabel({ className, children, ...props }) {
  const { error } = useFormField();
  return (
    <Text
      data-slot="form-label"
      className={cn(
        "text-sm font-medium",
        error ? "text-destructive" : "",
        className
      )}
      {...props}
    >
      {children}
    </Text>
  );
}

// RN에는 웹처럼 Slot/aria 연결 개념이 없어서 단순 컨테이너로 동작
export function FormControl({ className, children, ...props }) {
  return (
    <View data-slot="form-control" className={cn(className)} {...props}>
      {children}
    </View>
  );
}

export function FormDescription({ className, children, ...props }) {
  const {
    /* formDescriptionId */
  } = useFormField();
  return (
    <Text
      data-slot="form-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    >
      {children}
    </Text>
  );
}

export function FormMessage({ className, children, ...props }) {
  const { error } = useFormField();
  const body = error ? String(error?.message ?? "") : children;
  if (!body) return null;

  return (
    <Text
      data-slot="form-message"
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {body}
    </Text>
  );
}
