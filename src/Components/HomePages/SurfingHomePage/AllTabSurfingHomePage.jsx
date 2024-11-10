import Loader from "@/Components/CommonComponent/Loader";
import request from "@/Utils/AxiosUtils";
import { coupon, product } from "@/Utils/AxiosUtils/API";
import { useQuery } from "@tanstack/react-query";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { Col, TabContent, TabPane } from "reactstrap";

import BrandTab from "./SurfingHomePageTabs/BrandTab";
import CategoriesTab from "./SurfingHomePageTabs/CategoriesTab";
import ColumnBannerProductTab from "./SurfingHomePageTabs/ColumnBannerProductTab";
import FeaturedBlogTab from "./SurfingHomePageTabs/FeaturedBlogTab ";
import HomeBannerTab from "./SurfingHomePageTabs/HomeBannerTab";
import OfferBannerTab from "./SurfingHomePageTabs/OfferBannerTab";
import ProductList1Tab from "./SurfingHomePageTabs/ProductList1Tab";

const AllTabsSurfingHomePage = forwardRef(({ activeTab, values, setFieldValue, apiData = {} }, ref) => {
  const { categoryData, blogData, brandData, categoryLoader, brandLoader, categoryRefetch } = apiData;
  const [search, setSearch] = useState(false);
  const [customSearch, setCustomSearch] = useState("");
  const [tc, setTc] = useState(null);

  const {
    data: productData,
    isLoading: productLoader,
    refetch,
  } = useQuery(
    [product],
    () =>
      request({
        url: product,
        params: {
          status: 1,
          search: customSearch ? customSearch : "",
          paginate: values["content"]?.["products_ids"]?.length > 15 ? values["content"]?.["products_ids"]?.length : 15,
          ids: customSearch ? null : values["content"]["products_ids"].join() || null,
          with_union_products: values["content"]?.["products_ids"]?.length ? (values["content"]?.["products_ids"]?.length >= 15 ? 0 : 1) : 0,
        },
      }),
    {
      refetchOnWindowFocus: false,
      select: (res) =>
        res?.data?.data.map((elem) => {
          return { id: elem.id, name: elem.name, image: elem?.product_thumbnail?.original_url || "/assets/images/placeholder.png", slug: elem?.slug };
        }),
    }
  );
  const { data: couponsData } = useQuery([coupon], () => request({ url: coupon }), {
    refetchOnWindowFocus: false,
    select: (res) =>
      res?.data?.data.map((elem) => {
        return { id: elem.id, name: elem?.title };
      }),
  });

  useImperativeHandle(ref, () => ({
    call() {
      refetch();
    },
  }));

  // Added debouncing
  useEffect(() => {
    if (tc) clearTimeout(tc);
    setTc(setTimeout(() => setCustomSearch(search), 500));
  }, [search]);
  // Getting users data on searching users
  useEffect(() => {
    refetch();
  }, [customSearch]);

  if (productLoader || categoryLoader) return <Loader />;

  return (
    <Col xl="7" lg="8">
      <TabContent activeTab={activeTab}>
        <TabPane tabId="1">
          <HomeBannerTab values={values} setFieldValue={setFieldValue} categoryData={categoryData} productData={productData} setSearch={setSearch} />
        </TabPane>
        <TabPane tabId="2">
          <CategoriesTab values={values} setFieldValue={setFieldValue} categoryData={categoryData} />
        </TabPane>
        <TabPane tabId="3">
          <ProductList1Tab setSearch={setSearch} productData={productData} />
        </TabPane>
        <TabPane tabId="4">
          <OfferBannerTab setSearch={setSearch} categoryData={categoryData} values={values} setFieldValue={setFieldValue} productData={productData} />
        </TabPane>
        <TabPane tabId="5">
          <ColumnBannerProductTab setSearch={setSearch} categoryData={categoryData} values={values} setFieldValue={setFieldValue} productData={productData} />
        </TabPane>
        <TabPane tabId="6">
          <FeaturedBlogTab blogData={blogData} setSearch={setSearch} />
        </TabPane>
        <TabPane tabId="7">
          <BrandTab values={values} setSearch={setSearch} setFieldValue={setFieldValue} brandData={brandData} brandLoader={brandLoader} />
        </TabPane>
      </TabContent>
    </Col>
  );
});
export default AllTabsSurfingHomePage;
