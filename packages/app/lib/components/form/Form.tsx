import "../../index.css";

function renderJSON(data) {
  delete data.schema;
  return (
    <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>
  );
}

function render({ state }) {
  const { data } = state;
  return renderJSON(data);
}

export const Form = ({ state }) => {
  return (
    <div className="rounded-md font-mono flex flex-col gap-4 p-4">
      {
        render({state})
      }
    </div>
  );
}
