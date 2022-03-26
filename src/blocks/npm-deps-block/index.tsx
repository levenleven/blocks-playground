import { useEffect, useState } from "react";

import { InfoIcon } from "@primer/octicons-react";
import { FileBlockProps } from "@githubnext/utils";

type PackageJson = {
  name: string;
  version: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const parse = (content: string): PackageJson | undefined => {
  try {
    return JSON.parse(content);
  } catch {
    console.error("Failed to parse package");
  }
};

export default function ({ content }: FileBlockProps) {
  const packageMeta = parse(content);
  if (!packageMeta) {
    return "Failed to parse package.json";
  }

  const { name, version, dependencies, devDependencies, peerDependencies } =
    packageMeta;

  return (
    <div className="p-4">
      <h1 className="h1">
        {name}
        <span className="Label ml-4 Label--primary Label--inline">
          {version}
        </span>
      </h1>
      <div className="flash mt-2">
        <InfoIcon /> Click on package name for more details.
      </div>
      <Dependencies title="Dependencies" dependencies={dependencies} />
      <Dependencies title="Dev Dependencies" dependencies={devDependencies} />
      <Dependencies title="Peer Dependencies" dependencies={peerDependencies} />
    </div>
  );
}

type DepsProps = {
  title: string;
  dependencies?: Record<string, string>;
};

const Dependencies = ({ title, dependencies }: DepsProps) =>
  dependencies ? (
    <section>
      <div className="Subhead mt-4">
        <h2 className="Subhead-heading">{title}</h2>
      </div>
      {Object.entries(dependencies).map(([name, version]) => (
        <Package {...{ key: name, name, version }} />
      ))}
    </section>
  ) : null;

type PackageProps = {
  name: string;
  version: string;
};

type PackageDetails =
  | {
      name: string;
      description: string;
      version: string;
    }
  | { error: string };

const Package = ({ name, version }: PackageProps) => {
  const [expanded, setExpanded] = useState(false);
  const toggleDetails = () => setExpanded((v) => !v);

  const [details, setDetails] = useState<PackageDetails>();

  /**
   * Supports only registry.npmjs.org, name without alias
   */
  const loadDetails = async () => {
    try {
      const response = await fetch(
        `https://api.npms.io/v2/package/${encodeURIComponent(name)}`
      );

      setDetails(
        response.ok
          ? (await response.json()).collected.metadata
          : { error: "Failed to load details." }
      );
    } catch {
      setDetails({ error: "Failed to load details." });
    }
  };

  return (
    <>
      <div className="f4">
        <button className="Link" type="button" onClick={toggleDetails}>
          {name}
        </button>{" "}
        <span className="Label Label--primary Label--inline">{version}</span>
      </div>
      {expanded && (
        <PackageDetails details={details} loadDetails={loadDetails} />
      )}
    </>
  );
};

type PackageDetailsProps = { details?: PackageDetails; loadDetails: () => any };

const PackageDetails = ({ details, loadDetails }: PackageDetailsProps) => {
  useEffect(() => {
    if (!details) {
      loadDetails();
    }
  }, [details, loadDetails]);

  return (
    <div className="Box my-3">
      <div className="Box-body">
        {details ? (
          <div>
            {"error" in details ? (
              details.error
            ) : (
              <>
                <p>
                  <b>Latest version:</b> {details.version}
                </p>
                <p>
                  <b>Description:</b> {details.description}
                </p>
              </>
            )}
          </div>
        ) : (
          <>
            <span>Loading</span>
            <span className="AnimatedEllipsis"></span>
          </>
        )}
      </div>
    </div>
  );
};
