import BaseSidebarPanel from "./helpers/BaseSidebarPanel";
import TextInput from "./helpers/inputs/TextInput";
import MultiStylePropertyPanel from "./helpers/style-inputs/MultiStylePropertyPanel";

export default function UnsubscribeButtonSidebarPanel({ data, setData }: any) {
  const text = data.props?.text ?? "Unsubscribe";

  return (
    <BaseSidebarPanel title="Unsubscribe Button">
      <TextInput
        label="Text"
        defaultValue={text}
        onChange={(value) =>
          setData({
            ...data,
            props: {
              ...data.props,
              text: value,
            },
          })
        }
      />

      {/* 🔒 URL NOT EDITABLE */}

      <MultiStylePropertyPanel
        names={[
          "backgroundColor",
          "fontFamily",
          "fontSize",
          "fontWeight",
          "textAlign",
          "padding",
        ]}
        value={data.style}
        onChange={(style) => setData({ ...data, style })}
      />
    </BaseSidebarPanel>
  );
}
